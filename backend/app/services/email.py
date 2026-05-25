
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER or "placeholder",
    MAIL_PASSWORD=settings.SMTP_PASSWORD or "placeholder",
    MAIL_FROM=settings.EMAILS_FROM_EMAIL or "placeholder@example.com",
    MAIL_PORT=465, # Puerto SSL para Gmail
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    MAIL_FROM_NAME=settings.EMAILS_FROM_NAME
)

class EmailService:
    async def send_recovery_email(self, email_to: str, token: str) -> bool:
        print(f"📧 Attempting to send email to {email_to}")
        print(f"📧 SMTP config: USER={settings.SMTP_USER}, FROM={settings.EMAILS_FROM_EMAIL}")

        if not settings.SMTP_USER or not settings.SMTP_PASSWORD or settings.SMTP_USER == "placeholder":
            print(f"\n\n*** RECOVERY CODE FOR {email_to}: {token} ***\n\n")
            return False

        html = f"""
        <html>
        <body>
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4f46e5;">MindGuard IA</h2>
                <p>Hola,</p>
                <p>Has solicitado restablecer tu contraseña. Tu código de recuperación es:</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px;">
                    {token}
                </div>
                <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
            </div>
        </body>
        </html>
        """

        message = MessageSchema(
            subject="Código de Recuperación - MindGuard IA",
            recipients=[email_to],
            body=html,
            subtype=MessageType.html
        )

        try:
            fm = FastMail(conf)
            await fm.send_message(message)
            print(f"✅ Email sent successfully to {email_to}")
        except Exception as e:
            print(f"❌ FAILED TO SEND EMAIL: {e}")
            print(f"\n\n*** RECOVERY CODE FOR {email_to}: {token} ***\n\n")
            return False
        return True

email_service = EmailService()
