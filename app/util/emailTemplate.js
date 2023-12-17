module.exports = {
  getEmailTemplate(url) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
          /* Add your email styling here */
          body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 5px;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
              color: #333;
              text-align: center;
          }
          p {
              color: #666;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: #fff;
              text-decoration: none;
              border-radius: 3px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Email Verification</h1>
          <p>Thank you for registering with us! To complete your registration, please click the button below to verify your email address:</p>
          <a class="button" href="${url}">Verify Email</a>
          <p>If you didn't register for this account, you can safely ignore this email.</p>
      </div>
  </body>
  </html>
`
  }
}
