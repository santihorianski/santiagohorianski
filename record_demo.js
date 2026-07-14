import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

(async () => {
  console.log('Iniciando navegador oculto (Puppeteer)...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    defaultViewport: {
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    }
  });
  const page = await browser.newPage();
  
  // Fake the user agent to look like an iPhone
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1');

  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30,
    videoFrame: { width: 393, height: 852 },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
  });

  console.log('Navegando a la web (localhost:5173)...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  console.log('Iniciando grabación: demo_iphone.mp4');
  await recorder.start('./demo_iphone.mp4');

  // Esperar un segundo para que se vea el hero inicial
  await new Promise(r => setTimeout(r, 1500));

  console.log('Haciendo scroll simulado...');
  // Scroll down a bit
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 60;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 1800) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  await new Promise(r => setTimeout(r, 1000));

  // Click en "Catálogo" o "Proyectos" (botón de menú abajo) o simplemente abrir el Drawer
  console.log('Interactuando con menú y pestañas...');
  try {
    await page.click('.mobile-toggle'); // Abrir menú móvil
    await new Promise(r => setTimeout(r, 1000));
    const navLinks = await page.$$('.mobile-nav-link');
    if (navLinks.length > 1) {
      await navLinks[1].click(); // Click en Proyectos
    }
    await new Promise(r => setTimeout(r, 1500));
    
    // Volver a hacer scroll para ver el catálogo
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        let timer = setInterval(() => {
          window.scrollBy(0, 50);
          totalHeight += 50;
          if (totalHeight > 800) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

  } catch (e) {
    console.log('No se pudo interactuar con el menú, continuando...', e.message);
  }

  await new Promise(r => setTimeout(r, 2000));

  console.log('Finalizando grabación...');
  await recorder.stop();
  await browser.close();
  console.log('¡Simulación completada! Video guardado como: demo_iphone.mp4');
})();
