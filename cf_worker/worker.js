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
            <style>
              body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0b141a; margin: 0; padding: 20px; color: #e9edef; }
              .chat-container { max-width: 500px; margin: 0 auto; background-color: #0b141a; border-radius: 12px; overflow: hidden; padding: 10px; }
              
              /* Header de chat (similar a WA) */
              .chat-header { background-color: #202c33; padding: 15px; display: flex; align-items: center; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
              .chat-header img { width: 45px; height: 45px; border-radius: 50%; margin-right: 15px; background: #3a1d5e; padding: 2px; }
              .chat-header h1 { margin: 0; font-size: 18px; color: #e9edef; font-weight: 500; }
              .chat-header p { margin: 2px 0 0 0; font-size: 13px; color: #8696a0; }
              
              /* Burbuja de mensaje */
              .chat-bubble { background-color: #202c33; border-radius: 12px; border-top-left-radius: 0; padding: 12px 16px; position: relative; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.3); color: #e9edef; font-size: 15px; line-height: 1.5; }
              .chat-bubble::before { content: ""; position: absolute; top: 0; left: -10px; width: 0; height: 0; border-top: 15px solid #202c33; border-left: 15px solid transparent; }
              
              .chat-bubble p { margin: 0 0 10px 0; }
              
              .code-box { background-color: #111b21; border: 1px dashed #e8b923; border-radius: 8px; padding: 15px; text-align: center; margin: 15px 0; }
              .code-label { font-size: 13px; color: #e8b923; font-weight: 700; margin-bottom: 5px; text-transform: uppercase; }
              .code-value { font-size: 32px; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: 2px; }
              
              .btn-wa { display: inline-block; background-color: #e8b923; color: #000000 !important; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 800; font-size: 16px; text-align: center; margin-top: 10px; }
              .btn-wa:hover { background-color: #fbd34d; }
              
              .time-stamp { text-align: right; font-size: 11px; color: #8696a0; margin-top: 5px; display: block; }
              
              .social-links { margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; }
              
              .footer { text-align: center; font-size: 12px; color: #8696a0; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="chat-container">
              <div class="chat-header">
                <img src="https://santiagohorianski.com/favicon.png" alt="Santi" />
                <div>
                  <h1 style="font-weight: 800;">Buzón Ciudadano</h1>
                  <p>Santiago Horianski • Cuenta oficial</p>
                </div>
              </div>
              
              <div class="chat-bubble">
                <p style="font-size: 16px;">¡Hola <strong style="font-size: 17px; color: #e8b923;">${recipientName}</strong>! 👋</p>
                <p>Gracias por comprometerte y ayudarnos a mejorar nuestra ciudad. Ya registramos tu reporte sobre <strong style="color: #ffffff;">"${category}"</strong> y lo tenemos agendado.</p>
                
                <div class="code-box">
                  <div class="code-label">Tu Código de Seguimiento</div>
                  <div class="code-value">#${trackingCode}</div>
                </div>
                
                <p>Podés usar este código para seguir el estado de tu trámite en tiempo real desde acá:</p>
                
                <div style="text-align: center; margin-bottom: 15px;">
                  <a href="https://santiagohorianski.com/gestion?codigo=${trackingCode}" class="btn-wa">Seguir mi Reclamo</a>
                </div>
                
                <p style="font-weight: bold;">La política real se hace escuchando. ¡Un abrazo grande!</p>
                
                <div class="social-links">
                  <a href="https://instagram.com/santi.horianski" target="_blank" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); padding: 8px 18px; border-radius: 20px; color: white; text-decoration: none; font-weight: bold; font-size: 13px; margin: 5px;">📸 Instagram</a>
                  <a href="https://www.tiktok.com/@santiagohorianski" target="_blank" style="display: inline-block; background: #222222; border: 1px solid #444; padding: 8px 18px; border-radius: 20px; color: white; text-decoration: none; font-weight: bold; font-size: 13px; margin: 5px;">🎵 TikTok</a>
                </div>

                <span class="time-stamp">Leído ✓✓</span>
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
