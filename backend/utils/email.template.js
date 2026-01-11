// email.template.js - SubTrack Edition matching UI theme

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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(to bottom right, #0f172a 0%, #1e293b 50%, #334155 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 48px 40px; text-align: center; position: relative;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.3), transparent 50%), radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.3), transparent 50%); pointer-events: none;"></div>
                    <div style="position: relative; z-index: 1;">
                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.2);">
                            <span style="font-size: 28px;">⚡</span>
                        </div>
                        <h1 style="margin: 0; font-size: 40px; font-weight: 800; color: #ffffff; letter-spacing: -1px; font-family: 'Inter', sans-serif; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
                            SubTrack
                        </h1>
                        <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.85); font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', sans-serif;">
                            Subscription Manager
                        </p>
                    </div>
                </td>
            </tr>
            
            <!-- Alert Badge -->
            <tr>
                <td style="padding: 0; text-align: center; transform: translateY(-22px);">
                    <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 12px 32px; border-radius: 999px; box-shadow: 0 10px 40px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);">
                        <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 700; font-family: 'Inter', sans-serif; letter-spacing: 0.3px;">
                            ⏰ Renews in ${daysLeft} ${
  daysLeft === 1 ? "Day" : "Days"
}
                        </p>
                    </div>
                </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 20px 40px 40px; background: rgba(15, 23, 42, 0.6);">
                    <p style="font-size: 17px; color: #f1f5f9; margin: 0 0 12px; font-family: 'Inter', sans-serif; font-weight: 400;">
                        Hey <span style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">${userName}</span> 👋
                    </p>
                    
                    <p style="font-size: 15px; color: #cbd5e1; line-height: 1.7; margin: 0 0 32px; font-family: 'Inter', sans-serif; font-weight: 400;">
                        Your <strong style="color: #f1f5f9; font-weight: 600;">${subscriptionName}</strong> subscription is scheduled to renew on <strong style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">${renewalDate}</strong>.
                    </p>
                    
                    <!-- Subscription Details Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; margin-bottom: 32px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);">
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 13px; color: #94a3b8; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Plan</td>
                                        <td style="text-align: right; font-size: 15px; color: #f1f5f9; font-weight: 600; font-family: 'Inter', sans-serif;">${planName}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: rgba(99, 102, 241, 0.05);">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 13px; color: #94a3b8; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Price</td>
                                        <td style="text-align: right; font-size: 20px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; font-family: 'Inter', sans-serif;">${price}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 13px; color: #94a3b8; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Payment</td>
                                        <td style="text-align: right; font-size: 15px; color: #f1f5f9; font-weight: 600; font-family: 'Inter', sans-serif;">${paymentMethod}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.7; margin: 0 0 28px; font-family: 'Inter', sans-serif; font-weight: 400;">
                        Want to make changes? Visit your <a href="${accountSettingsLink}" style="color: #818cf8; text-decoration: none; font-weight: 600; border-bottom: 1px solid rgba(129, 140, 248, 0.3); transition: all 0.2s;">account settings</a> before the renewal date.
                    </p>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 28px;">
                        <tr>
                            <td style="text-align: center;">
                                <a href="${accountSettingsLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; font-family: 'Inter', sans-serif; box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1); transition: all 0.3s ease; letter-spacing: 0.3px;">
                                    Manage Subscription →
                                </a>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 13px; color: #94a3b8; line-height: 1.7; margin: 0; font-family: 'Inter', sans-serif; font-weight: 400; text-align: center;">
                        Need help? <a href="${supportLink}" style="color: #818cf8; text-decoration: none; font-weight: 600;">Contact support</a>
                    </p>
                    
                    <p style="font-size: 14px; color: #e2e8f0; margin: 32px 0 0; font-family: 'Inter', sans-serif; font-weight: 400; text-align: center;">
                        Best,<br>
                        <strong style="font-weight: 700;">The SubTrack Team</strong>
                    </p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background: rgba(15, 23, 42, 0.8); padding: 28px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="margin: 0 0 12px; font-size: 12px; color: #64748b; font-family: 'Inter', sans-serif; font-weight: 500;">
                        SubTrack | Never miss a renewal
                    </p>
                    <p style="margin: 0;">
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 10px; font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;">Preferences</a>
                        <span style="color: #475569;">•</span>
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 10px; font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;">Privacy</a>
                        <span style="color: #475569;">•</span>
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 10px; font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;">Terms</a>
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
    `🎉 Welcome! Your ${data.subscriptionName} is Now Tracked`,
  generateBody: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(to bottom right, #0f172a 0%, #1e293b 50%, #334155 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 56px 40px; text-align: center; position: relative;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.3), transparent 50%), radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.3), transparent 50%); pointer-events: none;"></div>
                    <div style="position: relative; z-index: 1;">
                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 16px; border-radius: 50%; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.2);">
                            <span style="font-size: 48px;">🎉</span>
                        </div>
                        <h1 style="margin: 0; font-size: 40px; font-weight: 800; color: #ffffff; letter-spacing: -1px; font-family: 'Inter', sans-serif; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
                            SubTrack
                        </h1>
                        <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.85); font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', sans-serif;">
                            Subscription Manager
                        </p>
                    </div>
                </td>
            </tr>
            
            <!-- Success Badge -->
            <tr>
                <td style="padding: 0; text-align: center; transform: translateY(-22px);">
                    <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 12px 32px; border-radius: 999px; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);">
                        <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 700; font-family: 'Inter', sans-serif; letter-spacing: 0.3px;">
                            ✓ Subscription Added
                        </p>
                    </div>
                </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 20px 40px 40px; background: rgba(15, 23, 42, 0.6);">
                    <h2 style="font-size: 28px; color: #f1f5f9; margin: 0 0 16px; font-family: 'Inter', sans-serif; font-weight: 800; text-align: center; letter-spacing: -0.5px;">
                        Welcome Aboard! 🚀
                    </h2>
                    
                    <p style="font-size: 15px; color: #cbd5e1; line-height: 1.7; margin: 0 0 12px; font-family: 'Inter', sans-serif; font-weight: 400; text-align: center;">
                        Hey <span style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">${data.userName}</span>!
                    </p>
                    
                    <p style="font-size: 14px; color: #94a3b8; line-height: 1.7; margin: 0 0 32px; font-family: 'Inter', sans-serif; font-weight: 400; text-align: center;">
                        Great news! We're now tracking your <strong style="color: #f1f5f9; font-weight: 600;">${data.subscriptionName}</strong> subscription.<br>You'll receive timely reminders before your renewal date.
                    </p>
                    
                    <!-- Subscription Details Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; margin-bottom: 28px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);">
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 13px; color: #94a3b8; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Subscription</td>
                                        <td style="text-align: right; font-size: 15px; color: #f1f5f9; font-weight: 600; font-family: 'Inter', sans-serif;">${data.subscriptionName}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: rgba(99, 102, 241, 0.05);">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 13px; color: #94a3b8; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Price</td>
                                        <td style="text-align: right; font-size: 20px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; font-family: 'Inter', sans-serif;">${data.price}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 13px; color: #94a3b8; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Renewal Date</td>
                                        <td style="text-align: right; font-size: 15px; color: #f1f5f9; font-weight: 600; font-family: 'Inter', sans-serif;">${data.renewalDate}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 24px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 13px; color: #94a3b8; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">Days Until Renewal</td>
                                        <td style="text-align: right; font-size: 15px; color: #fbbf24; font-weight: 700; font-family: 'Inter', sans-serif;">${data.daysUntilRenewal} days</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Reminder Schedule Box -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(251, 191, 36, 0.1); border-radius: 12px; border-left: 3px solid #fbbf24; margin-bottom: 28px; backdrop-filter: blur(10px);">
                        <tr>
                            <td style="padding: 20px 24px;">
                                <p style="margin: 0 0 12px; font-size: 14px; color: #fbbf24; font-weight: 700; font-family: 'Inter', sans-serif; letter-spacing: 0.3px;">
                                    📅 Reminder Schedule
                                </p>
                                <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.8; font-family: 'Inter', sans-serif; font-weight: 400;">
                                    You'll receive email reminders:<br>
                                    <span style="display: inline-block; margin: 4px 0;">• 7 days before renewal</span><br>
                                    <span style="display: inline-block; margin: 4px 0;">• 5 days before renewal</span><br>
                                    <span style="display: inline-block; margin: 4px 0;">• 2 days before renewal</span><br>
                                    <span style="display: inline-block; margin: 4px 0;">• 1 day before renewal</span>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.7; margin: 0 0 28px; font-family: 'Inter', sans-serif; font-weight: 400; text-align: center;">
                        Manage your subscription anytime from your dashboard
                    </p>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 28px;">
                        <tr>
                            <td style="text-align: center;">
                                <a href="${data.accountSettingsLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; font-family: 'Inter', sans-serif; box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1); letter-spacing: 0.3px;">
                                    View Dashboard →
                                </a>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 13px; color: #94a3b8; line-height: 1.7; margin: 0; font-family: 'Inter', sans-serif; font-weight: 400; text-align: center;">
                        Questions? <a href="${data.supportLink}" style="color: #818cf8; text-decoration: none; font-weight: 600;">Contact support</a>
                    </p>
                    
                    <p style="font-size: 14px; color: #e2e8f0; margin: 32px 0 0; font-family: 'Inter', sans-serif; font-weight: 400; text-align: center;">
                        Best,<br>
                        <strong style="font-weight: 700;">The SubTrack Team</strong> 💜
                    </p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background: rgba(15, 23, 42, 0.8); padding: 28px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="margin: 0 0 12px; font-size: 12px; color: #64748b; font-family: 'Inter', sans-serif; font-weight: 500;">
                        SubTrack | Never miss a renewal
                    </p>
                    <p style="margin: 0;">
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 10px; font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;">Preferences</a>
                        <span style="color: #475569;">•</span>
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 10px; font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;">Privacy</a>
                        <span style="color: #475569;">•</span>
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 10px; font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;">Terms</a>
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
    label: "1 day before reminder",
    generateSubject: (data) =>
      `⚡ Final Reminder: ${data.subscriptionName} Renews Tomorrow!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 1 }),
  },
];
