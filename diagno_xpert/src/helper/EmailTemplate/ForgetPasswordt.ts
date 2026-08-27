export function resetPasswordEmailTemplate(userName: string, resetLink: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h2 {
                color: #333333;
            }
            p {
                color: #555555;
            }
            a.button {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #0070f3;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
            }
            a.button:hover {
                background-color: #005bb5;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your DiagnoXpert password.</p>
            <p>Click the button below to choose a new password. This link will expire in 15 minutes.</p>
            <a class="button" href="${resetLink}">Reset Password</a>
            <p>If you did not request this change, please ignore this email.</p>
            <p>— DiagnoXpert Security Team</p>
        </div>
    </body>
    </html>
  `;
}
