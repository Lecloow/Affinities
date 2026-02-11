import smtplib
import logging
import os
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from dotenv import load_dotenv
import psycopg

# =============================
# CONFIG
# =============================

RATE_LIMIT_SECONDS = 0.2      # 5 emails/sec
MAX_RETRIES = 3               # retry si erreur temporaire
SMTP_SERVER = "smtp.office365.com"
SMTP_PORT = 587

# =============================
# INIT
# =============================

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

# =============================
# DB CONNECTION
# =============================

def get_db_connection():
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        return psycopg.connect(database_url)

    return psycopg.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', '5432')),
        dbname=os.getenv('DB_NAME', 'saintvalentin'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

# =============================
# SMTP CONNECTION
# =============================

def create_smtp_connection():
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
    server.starttls()
    server.login(os.getenv("EMAIL"), os.getenv("PASSWORD"))
    return server

# =============================
# EMAIL BUILDER
# =============================

def build_email(destinataire: str, code: str, name: str) -> MIMEMultipart:
    expediteur = os.getenv("EMAIL")
    url = "https://comitedepromo2026.fr"

    message = MIMEMultipart("related")
    message["From"] = expediteur
    message["To"] = destinataire
    message["Subject"] = "Code d’accès pour l’événement Saint-Valentin du comité de promo 2026"

    corps = f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 15px; color: #000;">
        <p>Salut {name} 👋</p>

        <p>
          Voici ton code personnel pour accéder au site de l’événement
          Saint-Valentin organisé par le comité de promo 💘
        </p>

        <p style="
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
          background-color: #f3f3f3;
          padding: 10px 15px;
          display: inline-block;
          border-radius: 6px;
        ">
          {code}
        </p>

        <p>
          Accède au site ici :
          <a href="{url}">{url}</a>
        </p>

        <p>
          Garde bien ton code, il te sera demandé pour te connecter 😉
        </p>

        <p>
          À très vite,<br>
          <strong>Le comité de promo 2026</strong>
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:20px;">
          <tr>
            <td align="center">
              <img src="cid:logo"
                   alt="Logo Comité de promo"
                   width="130"
                   style="width:130px; max-width:130px; height:auto; display:block; border-radius:8px;">
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    message.attach(MIMEText(corps, "html", "utf-8"))

    try:
        with open("logo.png", "rb") as f:
            img = MIMEImage(f.read())
            img.add_header("Content-ID", "<logo>")
            img.add_header("Content-Disposition", "inline", filename="logo.png")
            message.attach(img)
    except FileNotFoundError:
        logger.warning("⚠️ logo.png introuvable, email envoyé sans image")

    return message

# =============================
# SEND WITH RETRY
# =============================

def send_email(server, destinataire, code, name):
    for attempt in range(MAX_RETRIES):
        try:
            message = build_email(destinataire, code, name)
            server.send_message(message)
            return True, "OK"

        except smtplib.SMTPResponseException as e:
            # Gestion spécifique 432 concurrent connections
            if e.smtp_code == 432:
                wait_time = 2 * (attempt + 1)
                logger.warning(f"⚠️ 432 concurrent connection, retry dans {wait_time}s...")
                time.sleep(wait_time)
                server.quit()
                server = create_smtp_connection()
                continue
            else:
                return False, f"SMTP {e.smtp_code}"

        except Exception as e:
            return False, str(e)

    return False, "Max retries exceeded"

# =============================
# MAIN
# =============================

def send_all_emails():
    start_time = time.time()
    logger.info("🚀 Launching...\n")

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        SELECT users.email, passwords.password, users.first_name
        FROM users
        JOIN passwords ON users.id = passwords.user_id::TEXT
        ORDER BY users.first_name
    """)

    rows = cursor.fetchall()
    cursor.close()
    db.close()

    if not rows:
        logger.warning("⚠️ Aucun utilisateur trouvé")
        return

    logger.info(f"📧 {len(rows)} emails à envoyer\n")

    server = create_smtp_connection()

    success = 0
    failed = 0
    errors = []

    for email, code, first_name in rows:
        ok, msg = send_email(server, email, code, first_name)

        if ok:
            success += 1
        else:
            failed += 1
            errors.append((email, msg))

        time.sleep(RATE_LIMIT_SECONDS)

    server.quit()

    elapsed = time.time() - start_time

    logger.info("\n==============================")
    logger.info(f"Total : {len(rows)}")
    logger.info(f"Envoyés : {success}")
    logger.info(f"Échoués : {failed}")
    logger.info(f"Temps : {elapsed:.2f}s")
    logger.info(f"Vitesse : {len(rows)/elapsed:.2f} emails/sec")
    logger.info("==============================")

    if errors:
        logger.warning("\n⚠️ Erreurs :")
        for email, msg in errors[:10]:
            logger.warning(f"{email} → {msg}")
        if len(errors) > 10:
            logger.warning(f"... et {len(errors)-10} autres")

# =============================

if __name__ == "__main__":
    send_all_emails()
