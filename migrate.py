import psycopg
from urllib.parse import urlparse
from datetime import datetime, timedelta

def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

# --- Config DB ---
DATABASE_URL = "postgresql://saintvalen_user:k9HGnx1B4XsAEeZ9sBv2lYKA9eBFlzJ3@dpg-d61iiinpm1nc738coq9g-a.frankfurt-postgres.render.com/saintvalen_db"

result = urlparse(DATABASE_URL)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
port = result.port

conn = psycopg.connect(
    dbname=database,
    user=username,
    password=password,
    host=hostname,
    port=port
)
cur = conn.cursor()

# --- USERS ---
cur.execute("SELECT id, first_name, last_name, email, class FROM users_old")
rows = cur.fetchall()
log(f"Migration USERS: {len(rows)} lignes trouvées")
for row in rows:
    old_id, first_name, last_name, email, class_name = row
    cur.execute("""
        INSERT INTO users (id, first_name, last_name, email, class)
        VALUES (%s,%s,%s,%s,%s)
        ON CONFLICT (id) DO NOTHING
    """, (int(old_id), first_name, last_name, email, class_name))
log("✅ USERS migrés")

# --- CREDENTIALS / PASSWORDS ---
cur.execute("SELECT id, password FROM passwords_old")
rows = cur.fetchall()
log(f"Migration CREDENTIALS: {len(rows)} lignes trouvées")
for row in rows:
    old_id, password_hash = row
    cur.execute("""
        INSERT INTO credentials (user_id, password_hash)
        VALUES (%s, %s)
        ON CONFLICT (user_id) DO NOTHING
    """, (int(old_id), password_hash))
log("✅ CREDENTIALS migrés")

# --- SESSIONS ---
cur.execute("SELECT token, user_id, created_at FROM sessions_old")
rows = cur.fetchall()
log(f"Migration SESSIONS: {len(rows)} lignes trouvées")
for row in rows:
    token, old_user_id, created_at = row
    user_id = int(old_user_id)
    expires_at = created_at + timedelta(hours=48)
    cur.execute("""
        INSERT INTO sessions (token, user_id, created_at, expires_at)
        VALUES (%s,%s,%s,%s)
        ON CONFLICT (token) DO NOTHING
    """, (token, user_id, created_at, expires_at))
log("✅ SESSIONS migrées")

# --- MATCHES ---
cur.execute("SELECT id, day1, day2 FROM matches_old")
rows = cur.fetchall()
log(f"Migration MATCHES: {len(rows)} lignes trouvées")
for row in rows:
    user_id, match_day1, match_day2 = row
    if match_day1:
        cur.execute("""
            INSERT INTO matches (user_id, match_id, day)
            VALUES (%s, %s, 1)
            ON CONFLICT (user_id, match_id) DO NOTHING
        """, (int(user_id), int(match_day1)))
    if match_day2:
        cur.execute("""
            INSERT INTO matches (user_id, match_id, day)
            VALUES (%s, %s, 2)
            ON CONFLICT (user_id, match_id) DO NOTHING
        """, (int(user_id), int(match_day2)))
log("✅ MATCHES migrés")

# --- HINTS ---
cur.execute("""
    SELECT id, user_id, day, hint1_type, hint1_content, hint1_time, hint1_revealed,
           hint2_type, hint2_content, hint2_time, hint2_revealed,
           hint3_type, hint3_content, hint3_time, hint3_revealed, reveal_time
    FROM hints_old
""")
rows = cur.fetchall()
log(f"Migration HINTS: {len(rows)} lignes trouvées")
for row in rows:
    old_id, old_user_id, day, *hints = row
    for i, (hint_type, content, hint_time, revealed) in enumerate(zip(hints[0::4], hints[1::4], hints[2::4], hints[3::4]), start=1):
        if hint_type is None:
            continue
        cur.execute("""
            INSERT INTO hints (user_id, day, hint_number, difficulty, content, reveal_time, revealed)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (user_id, day, hint_number) DO NOTHING
        """, (int(old_user_id), int(day), i, hint_type, content, hint_time, revealed))
log("✅ HINTS migrés")

# --- GUESSES ---
cur.execute("SELECT id, user_id, day, hint_number, guessed_user_id, is_correct, created_at FROM guesses_old")
rows = cur.fetchall()
log(f"Migration GUESSES: {len(rows)} lignes trouvées")
for row in rows:
    old_id, old_user_id, day, hint_number, guessed_user_id, is_correct, created_at = row
    cur.execute("""
        INSERT INTO guesses (id, user_id, day, hint_number, guessed_user_id, is_correct, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (id) DO NOTHING
    """, (int(old_id), int(old_user_id), int(day), int(hint_number), int(guessed_user_id), is_correct, created_at))
log("✅ GUESSES migrés")

# --- SCORES ---
cur.execute("SELECT user_id, total_points, code_exchange_bonus, updated_at FROM scores_old")
rows = cur.fetchall()
log(f"Migration SCORES: {len(rows)} lignes trouvées")
for row in rows:
    old_user_id, total_points, code_exchange_bonus, updated_at = row
    cur.execute("""
        INSERT INTO scores (user_id, total_points, code_exchange_bonus, updated_at)
        VALUES (%s,%s,%s,%s)
        ON CONFLICT (user_id) DO NOTHING
    """, (int(old_user_id), total_points, code_exchange_bonus, updated_at))
log("✅ SCORES migrés")

# --- REVEAL_CODES ---
cur.execute("SELECT user_id, day, code, exchanged, exchanged_at FROM reveal_codes_old")
rows = cur.fetchall()
log(f"Migration REVEAL_CODES: {len(rows)} lignes trouvées")
for row in rows:
    old_user_id, day, code, exchanged, exchanged_at = row
    cur.execute("""
        INSERT INTO reveal_codes (user_id, day, code, exchanged, exchanged_at)
        VALUES (%s,%s,%s,%s,%s)
        ON CONFLICT (user_id, day) DO NOTHING
    """, (int(old_user_id), int(day), code, exchanged, exchanged_at))
log("✅ REVEAL_CODES migrés")

# --- Commit & close ---
conn.commit()
cur.close()
conn.close()
log("Migration terminée ✅")