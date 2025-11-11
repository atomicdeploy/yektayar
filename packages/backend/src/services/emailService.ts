import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'localhost'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
const SMTP_USER = process.env.SMTP_USER || 'info@yektayar.ir'
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'YektaYar <info@yektayar.ir>'

// Email templates
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Create email transporter
let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // For self-signed certificates in development
      }
    })
  }
  return transporter
}

// Email template functions
function getRegistrationEmailTemplate(name: string, verificationCode: string): EmailTemplate {
  const subject = 'خوش آمدید به یکتایار - کد تأیید'
  
  const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Tahoma', 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
            color: #333;
        }
        .verification-code {
            background-color: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .warning {
            background-color: #fff3cd;
            border-right: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>خوش آمدید به یکتایار</h1>
            <p>پلتفرم مراقبت از سلامت روان</p>
        </div>
        <div class="content">
            <h2>سلام ${name} عزیز،</h2>
            <p>از اینکه به یکتایار پیوستید خوشحالیم! برای تکمیل فرآیند ثبت‌نام، لطفاً کد تأیید زیر را در برنامه وارد کنید:</p>
            
            <div class="verification-code">
                <p style="margin: 0 0 10px 0; color: #666;">کد تأیید شما:</p>
                <div class="code">${verificationCode}</div>
            </div>
            
            <div class="warning">
                <strong>⚠️ توجه:</strong> این کد تنها برای 15 دقیقه معتبر است و تنها یک بار قابل استفاده می‌باشد.
            </div>
            
            <p>اگر شما درخواست ثبت‌نام نداده‌اید، لطفاً این ایمیل را نادیده بگیرید.</p>
            
            <p style="margin-top: 30px;">
                <strong>تیم یکتایار</strong><br>
                <small>همیشه در کنار شما</small>
            </p>
        </div>
        <div class="footer">
            <p>این ایمیل به صورت خودکار ارسال شده است. لطفاً به آن پاسخ ندهید.</p>
            <p>© 2024 یکتایار. تمامی حقوق محفوظ است.</p>
            <p><a href="https://yektayar.ir">yektayar.ir</a></p>
        </div>
    </div>
</body>
</html>
  `
  
  const text = `
خوش آمدید به یکتایار

سلام ${name} عزیز،

از اینکه به یکتایار پیوستید خوشحالیم! برای تکمیل فرآیند ثبت‌نام، لطفاً کد تأیید زیر را در برنامه وارد کنید:

کد تأیید: ${verificationCode}

⚠️ توجه: این کد تنها برای 15 دقیقه معتبر است.

اگر شما درخواست ثبت‌نام نداده‌اید، لطفاً این ایمیل را نادیده بگیرید.

تیم یکتایار
همیشه در کنار شما

---
این ایمیل به صورت خودکار ارسال شده است.
© 2024 یکتایار. تمامی حقوق محفوظ است.
yektayar.ir
  `
  
  return { subject, html, text }
}

function getPasswordResetEmailTemplate(name: string, resetCode: string): EmailTemplate {
  const subject = 'بازیابی رمز عبور - یکتایار'
  
  const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Tahoma', 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
            color: #333;
        }
        .reset-code {
            background-color: #f8f9fa;
            border: 2px solid #dc3545;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #dc3545;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .warning {
            background-color: #fff3cd;
            border-right: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>بازیابی رمز عبور</h1>
        </div>
        <div class="content">
            <h2>سلام ${name} عزیز،</h2>
            <p>درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شد. برای تغییر رمز عبور، از کد زیر استفاده کنید:</p>
            
            <div class="reset-code">
                <p style="margin: 0 0 10px 0; color: #666;">کد بازیابی:</p>
                <div class="code">${resetCode}</div>
            </div>
            
            <div class="warning">
                <strong>⚠️ توجه:</strong> این کد تنها برای 30 دقیقه معتبر است و تنها یک بار قابل استفاده می‌باشد.
            </div>
            
            <p><strong>اگر شما درخواست بازیابی رمز عبور نداده‌اید، فوراً با تیم پشتیبانی تماس بگیرید.</strong></p>
            
            <p style="margin-top: 30px;">
                <strong>تیم یکتایار</strong><br>
                <small>امنیت شما برای ما مهم است</small>
            </p>
        </div>
        <div class="footer">
            <p>این ایمیل به صورت خودکار ارسال شده است. لطفاً به آن پاسخ ندهید.</p>
            <p>© 2024 یکتایار. تمامی حقوق محفوظ است.</p>
            <p><a href="https://yektayar.ir">yektayar.ir</a></p>
        </div>
    </div>
</body>
</html>
  `
  
  const text = `
بازیابی رمز عبور - یکتایار

سلام ${name} عزیز،

درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شد. برای تغییر رمز عبور، از کد زیر استفاده کنید:

کد بازیابی: ${resetCode}

⚠️ توجه: این کد تنها برای 30 دقیقه معتبر است.

اگر شما درخواست بازیابی رمز عبور نداده‌اید، فوراً با تیم پشتیبانی تماس بگیرید.

تیم یکتایار
امنیت شما برای ما مهم است

---
این ایمیل به صورت خودکار ارسال شده است.
© 2024 یکتایار. تمامی حقوق محفوظ است.
yektayar.ir
  `
  
  return { subject, html, text }
}

function getAppointmentConfirmationEmailTemplate(name: string, appointmentDetails: {
  date: string
  time: string
  psychologistName: string
  type: string
}): EmailTemplate {
  const subject = 'تأیید نوبت مشاوره - یکتایار'
  
  const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Tahoma', 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
            color: #333;
        }
        .appointment-details {
            background-color: #f8f9fa;
            border-right: 4px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .detail-row {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .label {
            color: #666;
            font-size: 14px;
        }
        .value {
            color: #333;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ نوبت شما ثبت شد</h1>
        </div>
        <div class="content">
            <h2>سلام ${name} عزیز،</h2>
            <p>نوبت مشاوره شما با موفقیت ثبت شد. جزئیات نوبت به شرح زیر است:</p>
            
            <div class="appointment-details">
                <div class="detail-row">
                    <div class="label">تاریخ:</div>
                    <div class="value">${appointmentDetails.date}</div>
                </div>
                <div class="detail-row">
                    <div class="label">ساعت:</div>
                    <div class="value">${appointmentDetails.time}</div>
                </div>
                <div class="detail-row">
                    <div class="label">مشاور:</div>
                    <div class="value">${appointmentDetails.psychologistName}</div>
                </div>
                <div class="detail-row">
                    <div class="label">نوع جلسه:</div>
                    <div class="value">${appointmentDetails.type}</div>
                </div>
            </div>
            
            <p>لطفاً 10 دقیقه قبل از زمان مقرر آماده باشید.</p>
            
            <p style="margin-top: 30px;">
                <strong>تیم یکتایار</strong><br>
                <small>در کنار شما هستیم</small>
            </p>
        </div>
        <div class="footer">
            <p>این ایمیل به صورت خودکار ارسال شده است. لطفاً به آن پاسخ ندهید.</p>
            <p>© 2024 یکتایار. تمامی حقوق محفوظ است.</p>
            <p><a href="https://yektayar.ir">yektayar.ir</a></p>
        </div>
    </div>
</body>
</html>
  `
  
  const text = `
تأیید نوبت مشاوره - یکتایار

سلام ${name} عزیز،

نوبت مشاوره شما با موفقیت ثبت شد:

تاریخ: ${appointmentDetails.date}
ساعت: ${appointmentDetails.time}
مشاور: ${appointmentDetails.psychologistName}
نوع جلسه: ${appointmentDetails.type}

لطفاً 10 دقیقه قبل از زمان مقرر آماده باشید.

تیم یکتایار
در کنار شما هستیم

---
این ایمیل به صورت خودکار ارسال شده است.
© 2024 یکتایار. تمامی حقوق محفوظ است.
yektayar.ir
  `
  
  return { subject, html, text }
}

// Email sending functions
export async function sendRegistrationEmail(
  to: string,
  name: string,
  verificationCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getRegistrationEmailTemplate(name, verificationCode)
    const transport = getTransporter()
    
    await transport.sendMail({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending registration email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getPasswordResetEmailTemplate(name, resetCode)
    const transport = getTransporter()
    
    await transport.sendMail({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function sendAppointmentConfirmationEmail(
  to: string,
  name: string,
  appointmentDetails: {
    date: string
    time: string
    psychologistName: string
    type: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getAppointmentConfirmationEmailTemplate(name, appointmentDetails)
    const transport = getTransporter()
    
    await transport.sendMail({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Test email connection
export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = getTransporter()
    await transport.verify()
    return { success: true }
  } catch (error) {
    console.error('Error testing email connection:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
