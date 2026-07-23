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
            <meta name="color-scheme" content="dark">
            <meta name="supported-color-schemes" content="dark">
            <style>
              :root { color-scheme: dark; }
              body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0a0e; color: #e2dfeb; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background-color: #121016; border-radius: 16px; border: 1px solid #222222; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
              .header { background-color: #3a1d5e; background-image: linear-gradient(135deg, #743bbc 0%, #3a1d5e 100%); padding: 40px 20px; text-align: center; color: #ffffff; border-bottom: 2px solid #e8b923; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
              .content { padding: 40px 30px; line-height: 1.6; }
              .content p { margin: 0 0 20px 0; font-size: 16px; color: #e2dfeb; }
              .code-box { background-color: #1f1b13; border: 1px solid #332a13; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; }
              .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #e8b923; font-weight: 600; margin-bottom: 8px; }
              .code-value { font-size: 36px; font-weight: 800; color: #ffffff; font-family: monospace; margin: 0; letter-spacing: 2px; }
              .btn { display: inline-block; background-color: #e8b923; color: #000000 !important; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; text-align: center; box-shadow: 0 4px 15px rgba(232, 185, 35, 0.3); transition: all 0.2s; }
              .btn:hover { background-color: #fbd34d; }
              .footer { background-color: #0b0a0e; padding: 30px 20px; text-align: center; border-top: 1px solid #222222; font-size: 12px; color: #888398; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reclamos con Santiago Horianski</h1>
                <p style="margin: 10px 0 0 0; font-size: 15px; color: #f3d78c; font-weight: 500;">Tu voz en el Concejo</p>
              </div>
              <div class="content">
                <p>Hola <strong>${recipientName}</strong>,</p>
                <p>Gracias por comprometerte y ayudarnos a mejorar nuestra ciudad. Te confirmamos que hemos recibido tu reporte sobre <strong>"${category}"</strong> y nuestro equipo ya lo tiene registrado.</p>
                
                <div class="code-box">
                  <div class="code-label">Tu C\xF3digo de Seguimiento</div>
                  <div class="code-value">#${trackingCode}</div>
                </div>
                
                <p>Pod\xE9s usar este c\xF3digo para auditar el estado de tu tr\xE1mite en tiempo real desde nuestra plataforma:</p>
                
                <div style="text-align: center;">
                  <a href="https://santiagohorianski.com/gestion?codigo=${trackingCode}" class="btn">Seguir mi Reclamo</a>
                </div>
                
                <div style="margin-top: 40px; padding-top: 30px; border-top: 1px dashed rgba(255,255,255,0.1); text-align: center;">
                  <p style="color: #e8b923; font-weight: 600; font-size: 15px; margin-bottom: 20px;">La pol\xEDtica real se hace escuchando. Seguime para ver el trabajo del d\xEDa a d\xEDa o escribime para tomar un caf\xE9:</p>
                  <div style="margin-bottom: 15px;">
                    <a href="https://instagram.com/santi.horianski" target="_blank" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); padding: 12px 25px; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px;">
                      📸 Instagram
                    </a>
                    <a href="https://www.tiktok.com/@santiagohorianski" target="_blank" style="display: inline-block; background: #222222; border: 1px solid #444; padding: 12px 25px; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px;">
                      🎵 TikTok
                    </a>
                  </div>
                </div>
              </div>
              <div class="footer">
                Este es un correo autom\xE1tico enviado por el equipo de Santiago Horianski.<br>
                \xA9 ${year} Buz\xF3n Ciudadano. Todos los derechos reservados.
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
              from: "Santiago Horianski <reclamos@santiagohorianski.com>",
              to: [email],
              subject: `Reclamos con Santiago Horianski - Seguimiento #${trackingCode}`,
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
              type: "template",
              template: {
                name: "shipment_confirmation_5",
                language: {
                  code: "es"
                },
                components: [
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: recipientName },
                      { type: "text", text: category },
                      { type: "text", text: String(trackingCode) }
                    ]
                  }
                ]
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
