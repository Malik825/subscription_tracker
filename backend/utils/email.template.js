// Outstanding email templates matching your app's dark theme

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
</head>
<body style="margin: 0; padding: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
            
            <!-- Header -->
            <tr>
                <td style="background: #334155; padding: 40px; text-align: center; border-bottom: 1px solid #475569;">
                    <div style="display: inline-block; background: #475569; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                        <span style="font-size: 28px;">⚡</span>
                    </div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #f1f5f9;">
                        SmartAura Tracker
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                        Subscription Manager
                    </p>
                </td>
            </tr>
            
            <!-- Alert Badge -->
            <tr>
                <td style="padding: 32px 40px 0; text-align: center;">
                    <div style="display: inline-block; background: #f59e0b; padding: 10px 28px; border-radius: 6px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                        <p style="margin: 0; color: #ffffff; font-size: 13px; font-weight: 600;">
                            ⏰ Renews in ${daysLeft} ${
  daysLeft === 1 ? "Day" : "Days"
}
                        </p>
                    </div>
                </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 32px 40px;">
                    <p style="font-size: 16px; color: #f1f5f9; margin: 0 0 8px;">
                        Hey <span style="color: #818cf8; font-weight: 600;">${userName}</span> 👋
                    </p>
                    
                    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.7; margin: 0 0 28px;">
                        Your <strong style="color: #f1f5f9;">${subscriptionName}</strong> subscription is scheduled to renew on <strong style="color: #818cf8;">${renewalDate}</strong>.
                    </p>
                    
                    <!-- Subscription Details Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #334155; border-radius: 12px; overflow: hidden; margin-bottom: 28px;">
                        <tr>
                            <td style="padding: 16px 20px; border-bottom: 1px solid #475569;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Plan</td>
                                        <td style="text-align: right; font-size: 14px; color: #f1f5f9; font-weight: 600;">${planName}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 20px; border-bottom: 1px solid #475569; background: #3b4a5e;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</td>
                                        <td style="text-align: right; font-size: 20px; color: #818cf8; font-weight: 700;">${price}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 20px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Payment</td>
                                        <td style="text-align: right; font-size: 14px; color: #f1f5f9; font-weight: 600;">${paymentMethod}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 13px; color: #cbd5e1; line-height: 1.7; margin: 0 0 24px;">
                        Want to make changes? Visit your <a href="${accountSettingsLink}" style="color: #818cf8; text-decoration: none; font-weight: 600;">account settings</a> before the renewal date.
                    </p>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 24px;">
                        <tr>
                            <td style="text-align: center;">
                                <a href="${accountSettingsLink}" style="display: inline-block; background: #818cf8; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);">
                                    Manage Subscription →
                                </a>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.7; margin: 0; text-align: center;">
                        Need help? <a href="${supportLink}" style="color: #818cf8; text-decoration: none; font-weight: 600;">Contact support</a>
                    </p>
                    
                    <p style="font-size: 14px; color: #e2e8f0; margin: 28px 0 0; text-align: center;">
                        Best,<br>
                        <strong style="font-weight: 600;">The SmartAura Team</strong>
                    </p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background: #1e293b; padding: 24px 40px; text-align: center; border-top: 1px solid #334155;">
                    <p style="margin: 0 0 8px; font-size: 11px; color: #64748b;">
                        SmartAura Tracker | Never miss a renewal
                    </p>
                    <p style="margin: 0;">
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 8px; font-size: 11px;">Preferences</a>
                        <span style="color: #475569;">•</span>
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 8px; font-size: 11px;">Privacy</a>
                        <span style="color: #475569;">•</span>
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 8px; font-size: 11px;">Terms</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`;

export const generateGroupInvitationTemplate = ({
  recipientName,
  groupName,
  inviterName,
  dashboardLink,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
            
            <!-- Header -->
            <tr>
                <td style="background: #334155; padding: 48px 40px; text-align: center; border-bottom: 1px solid #475569;">
                    <div style="display: inline-block; background: #475569; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
                        <span style="font-size: 40px;">🎉</span>
                    </div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #f1f5f9;">
                        Group Invitation
                    </h1>
                    <p style="margin: 12px 0 0; font-size: 14px; color: #94a3b8;">
                        You've been invited to share subscription costs
                    </p>
                </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 40px;">
                    <p style="font-size: 16px; color: #f1f5f9; margin: 0 0 8px;">
                        Hi <span style="color: #818cf8; font-weight: 600;">${recipientName}</span>,
                    </p>
                    
                    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.7; margin: 0 0 28px;">
                        Great news! <strong style="color: #f1f5f9;">${inviterName}</strong> has invited you to join their subscription sharing group. By joining, you can split subscription costs and save money together!
                    </p>
                    
                    <!-- Group Info Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #334155; border-radius: 12px; overflow: hidden; margin-bottom: 28px; border-left: 4px solid #818cf8;">
                        <tr>
                            <td style="padding: 20px 24px;">
                                <p style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">
                                    Group Name
                                </p>
                                <p style="margin: 0; font-size: 20px; color: #f1f5f9; font-weight: 600;">
                                    ${groupName}
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Features List -->
                    <div style="margin-bottom: 28px;">
                        <p style="font-weight: 600; color: #f1f5f9; margin-bottom: 16px; font-size: 14px;">What you can do:</p>
                        
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="padding: 8px 0; vertical-align: top;">
                                    <div style="display: inline-block; width: 24px; height: 24px; background: #818cf8; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px;">
                                        <span style="color: #fff; font-size: 12px; font-weight: 600;">✓</span>
                                    </div>
                                </td>
                                <td style="padding: 8px 0;">
                                    <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                        Share subscription costs with group members
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; vertical-align: top;">
                                    <div style="display: inline-block; width: 24px; height: 24px; background: #818cf8; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px;">
                                        <span style="color: #fff; font-size: 12px; font-weight: 600;">✓</span>
                                    </div>
                                </td>
                                <td style="padding: 8px 0;">
                                    <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                        Track payments and see who owes what
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; vertical-align: top;">
                                    <div style="display: inline-block; width: 24px; height: 24px; background: #818cf8; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px;">
                                        <span style="color: #fff; font-size: 12px; font-weight: 600;">✓</span>
                                    </div>
                                </td>
                                <td style="padding: 8px 0;">
                                    <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                        Manage multiple subscriptions in one place
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; vertical-align: top;">
                                    <div style="display: inline-block; width: 24px; height: 24px; background: #818cf8; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px;">
                                        <span style="color: #fff; font-size: 12px; font-weight: 600;">✓</span>
                                    </div>
                                </td>
                                <td style="padding: 8px 0;">
                                    <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                        Get automatic payment reminders
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 24px;">
                        <tr>
                            <td style="text-align: center;">
                                <a href="${dashboardLink}" style="display: inline-block; background: #818cf8; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);">
                                    View Group Details →
                                </a>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.7; margin: 24px 0 0; text-align: center;">
                        If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                    
                    <p style="font-size: 14px; color: #e2e8f0; margin: 28px 0 0; text-align: center;">
                        Best,<br>
                        <strong style="font-weight: 600;">The SmartAura Team</strong>
                    </p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background: #1e293b; padding: 24px 40px; text-align: center; border-top: 1px solid #334155;">
                    <p style="margin: 0 0 8px; font-size: 11px; color: #64748b;">
                        SmartAura Tracker | Manage subscriptions together
                    </p>
                    <p style="margin: 0;">
                        <a href="${dashboardLink}" style="color: #818cf8; text-decoration: none; margin: 0 8px; font-size: 11px;">Visit Dashboard</a>
                        <span style="color: #475569;">•</span>
                        <a href="${dashboardLink}/settings" style="color: #818cf8; text-decoration: none; margin: 0 8px; font-size: 11px;">Settings</a>
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
</head>
<body style="margin: 0; padding: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
            
            <!-- Header -->
            <tr>
                <td style="background: #334155; padding: 48px 40px; text-align: center; border-bottom: 1px solid #475569;">
                    <div style="display: inline-block; background: #10b981; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
                        <span style="font-size: 40px;">✓</span>
                    </div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9;">
                        Subscription Added!
                    </h1>
                    <p style="margin: 12px 0 0; font-size: 14px; color: #94a3b8;">
                        You'll receive timely reminders before renewal
                    </p>
                </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 40px;">
                    <p style="font-size: 16px; color: #f1f5f9; margin: 0 0 8px; text-align: center;">
                        Hey <span style="color: #818cf8; font-weight: 600;">${data.userName}</span>! 👋
                    </p>
                    
                    <p style="font-size: 14px; color: #94a3b8; line-height: 1.7; margin: 0 0 28px; text-align: center;">
                        Great news! We're now tracking your <strong style="color: #f1f5f9;">${data.subscriptionName}</strong> subscription.
                    </p>
                    
                    <!-- Subscription Details Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #334155; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                        <tr>
                            <td style="padding: 16px 20px; border-bottom: 1px solid #475569;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Subscription</td>
                                        <td style="text-align: right; font-size: 14px; color: #f1f5f9; font-weight: 600;">${data.subscriptionName}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 20px; border-bottom: 1px solid #475569; background: #3b4a5e;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</td>
                                        <td style="text-align: right; font-size: 20px; color: #818cf8; font-weight: 700;">${data.price}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 20px; border-bottom: 1px solid #475569;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Renewal Date</td>
                                        <td style="text-align: right; font-size: 14px; color: #f1f5f9; font-weight: 600;">${data.renewalDate}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 20px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Days Until Renewal</td>
                                        <td style="text-align: right; font-size: 14px; color: #fbbf24; font-weight: 600;">${data.daysUntilRenewal} days</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Reminder Schedule Box -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: rgba(251, 191, 36, 0.1); border-radius: 8px; border-left: 3px solid #fbbf24; margin-bottom: 24px;">
                        <tr>
                            <td style="padding: 16px 20px;">
                                <p style="margin: 0 0 12px; font-size: 13px; color: #fbbf24; font-weight: 600;">
                                    📅 Reminder Schedule
                                </p>
                                <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.7;">
                                    You'll receive email reminders:<br>
                                    • 7 days before renewal<br>
                                    • 5 days before renewal<br>
                                    • 2 days before renewal<br>
                                    • 1 day before renewal
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 24px;">
                        <tr>
                            <td style="text-align: center;">
                                <a href="${data.accountSettingsLink}" style="display: inline-block; background: #818cf8; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);">
                                    View Dashboard →
                                </a>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.7; margin: 0; text-align: center;">
                        Questions? <a href="${data.supportLink}" style="color: #818cf8; text-decoration: none; font-weight: 600;">Contact support</a>
                    </p>
                    
                    <p style="font-size: 14px; color: #e2e8f0; margin: 28px 0 0; text-align: center;">
                        Best,<br>
                        <strong style="font-weight: 600;">The SmartAura Team</strong> 💜
                    </p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background: #1e293b; padding: 24px 40px; text-align: center; border-top: 1px solid #334155;">
                    <p style="margin: 0 0 8px; font-size: 11px; color: #64748b;">
                        SmartAura Tracker | Never miss a renewal
                    </p>
                    <p style="margin: 0;">
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 8px; font-size: 11px;">Preferences</a>
                        <span style="color: #475569;">•</span>
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 8px; font-size: 11px;">Privacy</a>
                        <span style="color: #475569;">•</span>
                        <a href="#" style="color: #818cf8; text-decoration: none; margin: 0 8px; font-size: 11px;">Terms</a>
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
