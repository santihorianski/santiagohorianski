--1c6372f1de0fd608b6601c48acc8aeb60078c7056943d2528b46e6f06d54
Content-Disposition: form-data; name="worker.js"

// worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    if (request.method === "GET" && url.pathname === "/webhook") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      const VERIFY_TOKEN = env.WA_WEBHOOK_VERIFY_TOKEN || "buzon_ciudadano_secreto";
      if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
          console.log("WEBHOOK_VERIFIED");
          return new Response(challenge, { status: 200 });
        } else {
          return new Response("Forbidden", { status: 403 });
        }
      }
      return new Response("Webhook Endpoint", { status: 200 });
    }
    if (request.method === "POST" && url.pathname === "/webhook") {
      try {
        const body = await request.json();
        if (body.object === "whatsapp_business_account") {
          const entry = body.entry?.[0];
          const changes = entry?.changes?.[0];
          const value = changes?.value;
          const messages = value?.messages;
          if (messages && messages.length > 0) {
            const message = messages[0];
            const from = message.from;
            const text = message.text?.body || "";
            if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY && text) {
              await fetch(`${env.SUPABASE_URL}/rest/v1/whatsapp_messages`, {
                method: "POST",
                headers: {
                  "apikey": env.SUPABASE_ANON_KEY,
                  "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
                  "Content-Type": "application/json",
                  "Prefer": "return=minimal"
                },
                body: JSON.stringify({
                  sender_number: from,
                  message_text: text
                })
              });
            }
            if (env.WA_PHONE_NUMBER_ID && env.WA_TOKEN) {
              await fetch(`https://graph.facebook.com/v25.0/${env.WA_PHONE_NUMBER_ID}/messages`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${env.WA_TOKEN}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  to: from,
                  type: "text",
                  text: {
                    body: "\xA1Hola! \u{1F44B} Gracias por comunicarte con el *Buz\xF3n Ciudadano*.\n\nPara iniciar un nuevo reclamo, consultar un c\xF3digo de seguimiento o ver nuestros proyectos, por favor ingres\xE1 a nuestra plataforma oficial:\n\u{1F449} https://santiagohorianski.com/\n\n_(Este es un mensaje autom\xE1tico, nuestro equipo leer\xE1 tu mensaje a la brevedad)_"
                  }
                })
              });
            }
          }
        }
        return new Response("EVENT_RECEIVED", { status: 200 });
      } catch (err) {
        console.error("Webhook POST Error:", err);
        return new Response("Internal Server Error", { status: 500 });
      }
    }
    if (request.method === "POST" && url.pathname === "/reply") {
      try {
        const { to, text } = await request.json();
        if (!to || !text) {
          return new Response("Missing 'to' or 'text'", { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
        }
        if (env.WA_PHONE_NUMBER_ID && env.WA_TOKEN) {
          const waResponse = await fetch(`https://graph.facebook.com/v25.0/${env.WA_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.WA_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to,
              type: "text",
              text: { body: text }
            })
          });
          const waData = await waResponse.json();
          if (waResponse.ok && env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
            await fetch(`${env.SUPABASE_URL}/rest/v1/whatsapp_messages`, {
              method: "POST",
              headers: {
                "apikey": env.SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
              },
              body: JSON.stringify({
                sender_number: `ADMIN_TO_${to}`,
                message_text: text
              })
            });
          }
          return new Response(JSON.stringify({ success: waResponse.ok, data: waData }), {
            status: waResponse.ok ? 200 : 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
        return new Response("WhatsApp NO CONFIGURADO", { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }
    if (request.method !== "POST" || url.pathname !== "/") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
    try {
      const { email, phone, trackingCode, category, anonymousName } = await request.json();
      if (!email && !phone) {
        return new Response(JSON.stringify({ error: "Falta email o tel\xE9fono para notificar." }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const recipientName = anonymousName || "vecino";
      const year = (/* @__PURE__ */ new Date()).getFullYear();
      const results = {
        email: null,
        whatsapp: null
      };
      if (email && trackingCode && category) {
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; color: #333333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e1e8ed; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
              .content { padding: 40px 30px; line-height: 1.6; }
              .content p { margin: 0 0 20px 0; font-size: 16px; color: #4b5563; }
              .code-box { background: rgba(217, 160, 36, 0.08); border: 1px solid rgba(217, 160, 36, 0.2); border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; }
              .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #b45309; font-weight: 600; margin-bottom: 8px; }
              .code-value { font-size: 32px; font-weight: 800; color: #d9a024; font-family: monospace; margin: 0; }
              .btn { display: inline-block; background-color: #d9a024; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; }
              .btn:hover { background-color: #c28e1d; }
              .footer { background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Buz\xF3n Ciudadano</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${recipientName}</strong>,</p>
                <p>Hemos registrado con \xE9xito tu reclamo sobre la categor\xEDa <strong>"${category}"</strong> en nuestra plataforma de gesti\xF3n municipal.</p>
                
                <div class="code-box">
                  <div class="code-label">C\xF3digo de Seguimiento \xDAnico</div>
                  <div class="code-value">#${trackingCode}</div>
                </div>
                
                <p>Conserva este c\xF3digo para realizar consultas. Podr\xE1s auditar el estado del tr\xE1mite en tiempo real haciendo clic en el siguiente bot\xF3n:</p>
                
                <div style="text-align: center;">
                  <a href="https://santiagohorianski.com/gestion?codigo=${trackingCode}" class="btn" target="_blank" style="color: #ffffff;">Seguir mi Reclamo</a>
                </div>
                
                <p style="margin-top: 30px;">\xA1Muchas gracias por involucrarte para mejorar nuestra comunidad! \u{1F4AA}</p>
                <div style="margin-top: 40px; padding-top: 30px; border-top: 2px dashed #e1e8ed; text-align: center;">
                  <h3 style="color: #1e1b4b; font-size: 18px; margin-bottom: 20px;">Mirá cómo digo la verdad y las cosas que muchos no se animan a decir de frente:</h3>
                  <div style="margin-bottom: 15px;">
                    <a href="https://instagram.com/santi.horianski" target="_blank" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); padding: 12px 25px; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; font-size: 15px; margin: 5px;">
                      📸 Seguime en Instagram
                    </a>
                    <a href="https://www.tiktok.com/@santiagohorianski" target="_blank" style="display: inline-block; background: #000000; padding: 12px 25px; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; font-size: 15px; margin: 5px;">
                      🎵 Seguime en TikTok
                    </a>
                  </div>
                </div>
              </div>
              <div class="footer">
                Este es un correo autom\xE1tico enviado por el equipo de Santiago Horianski.<br>
                \xA9 ${year} Buz\xF3n Ciudadano Posadas. Todos los derechos reservados.
              </div>
            </div>
          </body>
          </html>
        `;
        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "Buz\xF3n Ciudadano <reclamos@santiagohorianski.com>",
              to: [email],
              subject: `Confirmaci\xF3n de Reclamo #${trackingCode}`,
              html: htmlContent
            })
          });
          const resendData = await resendResponse.json();
          results.email = { success: resendResponse.ok, data: resendData };
        } catch (e) {
          results.email = { success: false, error: e.message };
        }
      }
      if (phone && env.WA_PHONE_NUMBER_ID && env.WA_TOKEN) {
        const cleanPhone = phone.replace(/\D/g, "");
        try {
          const waResponse = await fetch(`https://graph.facebook.com/v25.0/${env.WA_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.WA_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: cleanPhone,
              type: "text",
              text: {
                body: `\xA1Hola ${recipientName}! \u{1F44B}

Recibimos correctamente tu reporte sobre la categor\xEDa *${category}*.

Tu c\xF3digo \xFAnico de seguimiento es: *#${trackingCode}*

Pod\xE9s consultar el estado de tu tr\xE1mite ingresando ese c\xF3digo en nuestro portal: https://santiagohorianski.com/

\xA1Gracias por involucrarte! \u{1F4AA}`
              }
            })
          });
          const waData = await waResponse.json();
          results.whatsapp = { success: waResponse.ok, data: waData };
        } catch (e) {
          results.whatsapp = { success: false, error: e.message };
        }
      } else if (phone) {
        results.whatsapp = { success: false, error: "Variables de entorno de WhatsApp no configuradas." };
      }
      return new Response(JSON.stringify({ success: true, results }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map

--1c6372f1de0fd608b6601c48acc8aeb60078c7056943d2528b46e6f06d54--
