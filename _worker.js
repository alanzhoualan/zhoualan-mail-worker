export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Endpoint to request a verification code
    if (url.pathname === "/api/send-code") {
      const email = url.searchParams.get("email");
      if (!email) {
        return new Response(JSON.stringify({ error: "Missing email parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }

      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // HTML template for the email
      const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 20px; }
    .container { background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); max-width: 480px; margin: 0 auto; border: 1px solid #eef2f5; }
    .logo { text-align: center; margin-bottom: 30px; font-size: 24px; font-weight: bold; color: #3b82f6; letter-spacing: 1px; }
    .title { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 20px; text-align: center; }
    .text { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 30px; text-align: center; }
    .code-box { font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 18px; text-align: center; border-radius: 8px; margin: 25px 0; border: 1px dashed #bfdbfe; font-family: monospace; }
    .divider { border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0; }
    .footer { font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">ZHOUALAN CLOUD</div>
    <div class="title">验证您的电子邮箱</div>
    <div class="text">您好，您的 6 位数验证码为：</div>
    <div class="code-box">${code}</div>
    <div class="text" style="font-size:13px; color:#9ca3af;">该验证码在 10 分钟内有效。如果非您本人操作，请忽略此邮件。</div>
    <hr class="divider">
    <div class="footer">
      此邮件为系统自动发出，请勿直接回复。<br>
      © 2026 zhoualan.dpdns.org. All rights reserved.
    </div>
  </div>
</body>
</html>`;

      try {
        // Call VPS backend securely
        const response = await fetch("https://proxy.zhoualan.dpdns.org/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer cfat_mail_shared_secret_2026"
          },
          body: JSON.stringify({
            to: email,
            subject: `[ZHOUALAN CLOUD] 邮箱验证码 ${code}`,
            content: htmlTemplate
          })
        });

        if (response.status === 200 || response.status === 201) {
          return new Response(JSON.stringify({ success: true, message: "Code sent successfully", code: code }), {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        } else {
          const resBody = await response.text();
          return new Response(JSON.stringify({ error: "Failed to send code via backend mailer", details: resBody }), {
            status: 502,
            headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: "Internal connection error", details: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }
    }

    // Decoy/default page for the Worker
    return new Response(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verification Services</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #fafbfe; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #edf2f7; text-align: center; max-width: 400px; }
    h1 { color: #2d3748; font-size: 24px; margin-bottom: 10px; }
    p { color: #718096; font-size: 15px; line-height: 1.6; margin-bottom: 25px; }
    .status { display: inline-flex; align-items: center; background: #e6fffa; color: #319795; padding: 6px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
    .status-dot { width: 8px; height: 8px; background: #38b2ac; border-radius: 50%; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="status"><span class="status-dot"></span>Service Online</div>
    <h1>Verification Services</h1>
    <p>This endpoint handles secure verification code delivery. Access via registered endpoints only.</p>
  </div>
</body>
</html>`, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
