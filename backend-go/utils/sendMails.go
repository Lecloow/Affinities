package utils

import (
	"fmt"
	"os"

	"gopkg.in/gomail.v2"
)

func BuildMessage(to, code, name string) *gomail.Message {
	url := "https://comitedepromo2026.fr"

	html := fmt.Sprintf(`
<html>
<body style="font-family: Arial, sans-serif; font-size: 15px; color: #000;">
    <p>Salut %s 👋</p>

    <p>
        Voici ton code personnel pour accéder au site de l’événement
        Saint-Valentin organisé par le comité de promo 💘
    </p>

    <p style="
      font-size:24px;
      font-weight:bold;
      letter-spacing:2px;
      background-color:#f3f3f3;
      padding:10px 15px;
      display:inline-block;
      border-radius:6px;">
      %s
    </p>

    <p>
      Accède au site ici :
      <a href="%s">%s</a>
    </p>

    <p>
      Garde bien ton code, il te sera demandé pour te connecter 😉
    </p>

    <p>
      À très vite,<br>
      <strong>Le comité de promo 2026</strong>
    </p>

    <img src="cid:logo" width="130">
</body>
</html>
`, name, code, url, url)

	m := gomail.NewMessage()

	m.SetHeader("From", os.Getenv("EMAIL"))
	m.SetHeader("To", to)
	m.SetHeader(
		"Subject",
		"Code d’accès pour l’événement Saint-Valentin du comité de promo 2026",
	)

	m.SetBody("text/html", html)

	if _, err := os.Stat("logo.png"); err == nil {
		m.Embed("logo.png", gomail.SetHeader(map[string][]string{
			"Content-ID": {"<logo>"},
		}))
	}

	return m
}