// email.template.js - Premium Edition with Poppins Font

export const generateEmailTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  planName,
  price,
  paymentMethod,
  accountSettingsLink,
  supportLink,
  daysLeft,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; font-family: 'Poppins', sans-serif;">
                        SmartAura
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 400; letter-spacing: 2px; text-transform: uppercase; font-family: 'Poppins', sans-serif;">
                        Subscription Tracker
                    </p>
                </td>
            </tr>
            
            <!-- Alert Badge -->
            <tr>
                <td style="padding: 0; text-align: center; transform: translateY(-20px);">
                    <div style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 12px 30px; border-radius: 30px; box-shadow: 0 10px 30px rgba(245, 87, 108, 0.4);">
                        <p style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                            ⏰ Renewal in ${daysLeft} ${
  daysLeft === 1 ? "Day" : "Days"
}
                        </p>
                    </div>
                </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 20px 40px 40px;">
                    <p style="font-size: 18px; color: #2d3748; margin: 0 0 12px; font-family: 'Poppins', sans-serif; font-weight: 400;">
                        Hello <span style="color: #667eea; font-weight: 600;">${userName}</span> 👋
                    </p>
                    
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.7; margin: 0 0 30px; font-family: 'Poppins', sans-serif; font-weight: 300;">
                        Your <strong style="color: #2d3748; font-weight: 600;">${subscriptionName}</strong> subscription is scheduled to renew on <strong style="color: #667eea; font-weight: 600;">${renewalDate}</strong>.
                    </p>
                    
                    <!-- Subscription Details Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border-radius: 12px; overflow: hidden; margin-bottom: 30px; border: 1px solid #e0e7ff;">
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid #e0e7ff;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 14px; color: #718096; font-weight: 500; font-family: 'Poppins', sans-serif;">Plan</td>
                                        <td style="text-align: right; font-size: 15px; color: #2d3748; font-weight: 600; font-family: 'Poppins', sans-serif;">${planName}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid #e0e7ff;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 14px; color: #718096; font-weight: 500; font-family: 'Poppins', sans-serif;">Price</td>
                                        <td style="text-align: right; font-size: 18px; color: #667eea; font-weight: 700; font-family: 'Poppins', sans-serif;">${price}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 14px; color: #718096; font-weight: 500; font-family: 'Poppins', sans-serif;">Payment Method</td>
                                        <td style="text-align: right; font-size: 15px; color: #2d3748; font-weight: 600; font-family: 'Poppins', sans-serif;">${paymentMethod}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 15px; color: #4a5568; line-height: 1.7; margin: 0 0 30px; font-family: 'Poppins', sans-serif; font-weight: 300;">
                        Want to make changes? Visit your <a href="${accountSettingsLink}" style="color: #667eea; text-decoration: none; font-weight: 600; border-bottom: 2px solid #667eea;">account settings</a> before the renewal date.
                    </p>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 30px;">
                        <tr>
                            <td style="text-align: center;">
                                <a href="${accountSettingsLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 15px; font-family: 'Poppins', sans-serif; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                                    Manage Subscription →
                                </a>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 14px; color: #718096; line-height: 1.7; margin: 0; font-family: 'Poppins', sans-serif; font-weight: 300;">
                        Need assistance? <a href="${supportLink}" style="color: #667eea; text-decoration: none; font-weight: 500;">Contact support</a> anytime.
                    </p>
                    
                    <p style="font-size: 15px; color: #2d3748; margin: 30px 0 0; font-family: 'Poppins', sans-serif; font-weight: 300;">
                        Best regards,<br>
                        <strong style="font-weight: 600;">The SmartAura Team</strong>
                    </p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 15px; font-size: 13px; color: #718096; font-family: 'Poppins', sans-serif; font-weight: 400;">
                        SmartAura Tracker | Making subscriptions simple
                    </p>
                    <p style="margin: 0;">
                        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 500;">Unsubscribe</a>
                        <span style="color: #cbd5e0;">•</span>
                        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 500;">Privacy</a>
                        <span style="color: #cbd5e0;">•</span>
                        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 500;">Terms</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = {
  label: "welcome",
  generateSubject: (data) =>
    `🎉 Welcome! Your ${data.subscriptionName} is Now Being Tracked`,
  generateBody: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; text-align: center; position: relative;">
                    <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 48px;">🎉</p>
                    </div>
                    <h1 style="margin: 0; font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; font-family: 'Poppins', sans-serif;">
                        SmartAura
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 400; letter-spacing: 2px; text-transform: uppercase; font-family: 'Poppins', sans-serif;">
                        Subscription Tracker
                    </p>
                </td>
            </tr>
            
            <!-- Success Badge -->
            <tr>
                <td style="padding: 0; text-align: center; transform: translateY(-25px);">
                    <div style="display: inline-block; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 14px 35px; border-radius: 30px; box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);">
                        <p style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                            ✓ Subscription Added Successfully
                        </p>
                    </div>
                </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 20px 40px 40px;">
                    <h2 style="font-size: 26px; color: #2d3748; margin: 0 0 20px; font-family: 'Poppins', sans-serif; font-weight: 600; text-align: center;">
                        Welcome Aboard! 🚀
                    </h2>
                    
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.7; margin: 0 0 12px; font-family: 'Poppins', sans-serif; font-weight: 400; text-align: center;">
                        Hello <span style="color: #667eea; font-weight: 600;">${data.userName}</span>!
                    </p>
                    
                    <p style="font-size: 15px; color: #718096; line-height: 1.7; margin: 0 0 35px; font-family: 'Poppins', sans-serif; font-weight: 300; text-align: center;">
                        Great news! We're now tracking your <strong style="color: #2d3748; font-weight: 600;">${data.subscriptionName}</strong> subscription.<br>You'll receive timely reminders before your renewal date.
                    </p>
                    
                    <!-- Subscription Details Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border-radius: 12px; overflow: hidden; margin-bottom: 30px; border: 1px solid #e0e7ff;">
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid #e0e7ff;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 14px; color: #718096; font-weight: 500; font-family: 'Poppins', sans-serif;">Subscription</td>
                                        <td style="text-align: right; font-size: 15px; color: #2d3748; font-weight: 600; font-family: 'Poppins', sans-serif;">${data.subscriptionName}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid #e0e7ff;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 14px; color: #718096; font-weight: 500; font-family: 'Poppins', sans-serif;">Price</td>
                                        <td style="text-align: right; font-size: 18px; color: #667eea; font-weight: 700; font-family: 'Poppins', sans-serif;">${data.price}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid #e0e7ff;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 14px; color: #718096; font-weight: 500; font-family: 'Poppins', sans-serif;">Renewal Date</td>
                                        <td style="text-align: right; font-size: 15px; color: #2d3748; font-weight: 600; font-family: 'Poppins', sans-serif;">${data.renewalDate}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 14px; color: #718096; font-weight: 500; font-family: 'Poppins', sans-serif;">Days Until Renewal</td>
                                        <td style="text-align: right; font-size: 15px; color: #f59e0b; font-weight: 700; font-family: 'Poppins', sans-serif;">${data.daysUntilRenewal} days</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Reminder Schedule Box -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                        <tr>
                            <td style="padding: 24px;">
                                <p style="margin: 0 0 12px; font-size: 15px; color: #78350f; font-weight: 600; font-family: 'Poppins', sans-serif;">
                                    📅 Reminder Schedule
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.8; font-family: 'Poppins', sans-serif; font-weight: 400;">
                                    You'll receive email reminders:<br>
                                    <span style="display: inline-block; margin: 4px 0;">• 7 days before renewal</span><br>
                                    <span style="display: inline-block; margin: 4px 0;">• 5 days before renewal</span><br>
                                    <span style="display: inline-block; margin: 4px 0;">• 2 days before renewal</span><br>
                                    <span style="display: inline-block; margin: 4px 0;">• 1 day before renewal</span>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 15px; color: #4a5568; line-height: 1.7; margin: 0 0 30px; font-family: 'Poppins', sans-serif; font-weight: 300; text-align: center;">
                        Manage your subscription anytime from your dashboard
                    </p>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 30px;">
                        <tr>
                            <td style="text-align: center;">
                                <a href="${data.accountSettingsLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 15px; font-family: 'Poppins', sans-serif; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);">
                                    View Dashboard →
                                </a>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 14px; color: #718096; line-height: 1.7; margin: 0; font-family: 'Poppins', sans-serif; font-weight: 300; text-align: center;">
                        Questions? <a href="${data.supportLink}" style="color: #667eea; text-decoration: none; font-weight: 500;">Contact support</a> anytime.
                    </p>
                    
                    <p style="font-size: 15px; color: #2d3748; margin: 35px 0 0; font-family: 'Poppins', sans-serif; font-weight: 300; text-align: center;">
                        Best regards,<br>
                        <strong style="font-weight: 600;">The SmartAura Team</strong> 💜
                    </p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 15px; font-size: 13px; color: #718096; font-family: 'Poppins', sans-serif; font-weight: 400;">
                        SmartAura Tracker | Making subscriptions simple
                    </p>
                    <p style="margin: 0;">
                        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 500;">Unsubscribe</a>
                        <span style="color: #cbd5e0;">•</span>
                        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 500;">Privacy</a>
                        <span style="color: #cbd5e0;">•</span>
                        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 500;">Terms</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
  `,
};

export const emailTemplates = [
  welcomeEmailTemplate,

  {
    label: "7 days before reminder",
    generateSubject: (data) =>
      `📅 Reminder: ${data.subscriptionName} Renews in 7 Days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 7 }),
  },
  {
    label: "5 days before reminder",
    generateSubject: (data) => `⏳ ${data.subscriptionName} Renews in 5 Days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 5 }),
  },
  {
    label: "2 days before reminder",
    generateSubject: (data) =>
      `🚀 Only 2 Days Left - ${data.subscriptionName} Renewal`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 2 }),
  },
  {
    label: "1 days before reminder",
    generateSubject: (data) =>
      `⚡ Final Reminder: ${data.subscriptionName} Renews Tomorrow!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 1 }),
  },
];
