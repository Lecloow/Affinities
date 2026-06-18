package handlers

import (
	"backend/utils"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gopkg.in/gomail.v2"
)

func (h *UserHandler) SendMails(c *gin.Context) {
	ctx := c.Request.Context()

    users, err := h.Service.LoadUsers(ctx)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    log.Println("Email:", os.Getenv("EMAIL"))
    dialer := gomail.NewDialer(
        "smtp.office365.com",
        587,
        os.Getenv("EMAIL"),
        os.Getenv("PASSWORD"),
    )

    sender, err := dialer.Dial()
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    defer sender.Close()

    success := 0
    failed := 0

    for _, user := range users {

        msg := utils.BuildMessage(
            user.Email,
            user.Password,
            user.FirstName,
        )

        if err := gomail.Send(sender, msg); err != nil {
            failed++
            log.Printf(
            "Error sending mail to %s (userId: %d): %v",
                user.Email,
                user.ID,
                err,
            )
            continue
        }

        success++
    }

    c.JSON(200, gin.H{
        "total":   len(users),
        "success": success,
        "failed":  failed,
    })
}