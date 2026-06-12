import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter

  const isDev = process.env.NODE_ENV === 'development'

  const opts: nodemailer.TransportOptions & Record<string, unknown> = {
    host: process.env.SES_HOST || (isDev ? 'localhost' : ''),
    port: Number(process.env.SES_PORT) || (isDev ? 25 : 465),
    pool: true,
    maxMessages: 100,
    maxConnections: 20,
  }

  if (isDev) {
    opts.ignoreTLS = true
  } else if (process.env.SES_USER && process.env.SES_PASS) {
    opts.auth = { user: process.env.SES_USER, pass: process.env.SES_PASS }
  }

  transporter = nodemailer.createTransport(opts)
  return transporter
}

const OG_URL = process.env.OG_URL || 'https://go.gov.sg'

export async function sendOtpEmail(
  email: string,
  otp: string,
): Promise<void> {
  const mail = getTransporter()
  await mail.sendMail({
    from: `GoGovSG <donotreply@mail.go.gov.sg>`,
    to: email,
    subject: 'One-Time Password (OTP) for GoGovSG',
    html: `Your OTP is <b>${otp}</b>. It will expire in 5 minutes.
           Please use this to verify your identity on <a href="${OG_URL}">${OG_URL}</a>.`,
  })
}
