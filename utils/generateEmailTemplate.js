const generateEmailTemplate = ({
  subject,
  headerText,
  bodyText,
  actionText,
  actionUrl,
  footerText,
  verificationCode,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dddddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }
        .header h1 {
            color: #0073e6;
            font-size: 24px;
            margin: 0;
        }
        .content {
            padding: 20px 0;
            text-align: center;
        }
        .verification-code {
            font-size: 20px;
            font-weight: bold;
            color: #0073e6;
            background-color: #f0f8ff;
            padding: 10px 20px;
            border-radius: 4px;
            display: inline-block;
            margin: 20px 0;
        }
        .action-button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #0073e6;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #777;
            padding-top: 20px;
            border-top: 1px solid #dddddd;
        }
        .footer a {
            color: #0073e6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>${headerText}</h1>
        </div>
        <div class="content">
            <p>${bodyText}</p>
            ${
              actionText && actionUrl
                ? `<a href="${actionUrl}" class="action-button">${actionText}</a>`
                : ""
            }
                ${
                  verificationCode &&
                  `<div class="verification-code">${verificationCode}</div>`
                }
        </div>
        <div class="footer">
            <p>${footerText || "Thank you for choosing our service!"}</p>
            <p>
                <a href="https://yourwebsite.com" target="_blank">Visit our website</a> |
                <a href="https://yourwebsite.com/contact" target="_blank">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

module.exports = generateEmailTemplate;
