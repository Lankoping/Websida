import nodemailer from 'nodemailer'

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}) => {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'noreply@lankoping.se'

  if (!host || !user || !pass) {
    console.warn('⚠️ SMTP credentials not fully configured. Email not sent.')
    console.log('Would have sent email to:', to)
    console.log('Subject:', subject)
    console.log('Text:', text)
    return false
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  })

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    })
    console.log('Message sent: %s', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
