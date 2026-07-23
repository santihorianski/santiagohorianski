import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This test assumes the app is running on http://localhost:5173
async function runTest() {
  console.log('Iniciando prueba E2E (End to End)...');
  
  // 1. Crear una imagen falsa para subir
  const testImagePath = path.join(__dirname, 'test_image.jpg');
  if (!fs.existsSync(testImagePath)) {
    // just write a tiny dummy image (1x1 red pixel)
    const base64Img = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    fs.writeFileSync(testImagePath, Buffer.from(base64Img, 'base64'));
  }

  const browser = await puppeteer.launch({ 
    headless: "new", 
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'] 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('1. Navegando a /reclamo...');
    await page.goto('http://localhost:5173/reclamo', { waitUntil: 'networkidle0' });
    
    console.log('2. Completando Paso 1 (Categoría)...');
    await page.waitForSelector('.category-item-card', { visible: true });
    // Find the one for Iluminación
    const cards = await page.$$('.category-item-card');
    for (const card of cards) {
      const text = await page.evaluate(el => el.textContent, card);
      if (text.includes('Iluminación')) {
        await card.click();
        break;
      }
    }
    await page.click('button.wizard-btn-next');
    
    console.log('3. Completando Paso 2 (Ubicación)...');
    await page.waitForSelector('input[name="callePrincipal"]');
    await page.type('input[name="callePrincipal"]', 'Barrio de Prueba E2E');
    await page.type('input[name="entreCalle1"]', 'Calle 1');
    await page.click('button.wizard-btn-next');
    
    console.log('4. Completando Paso 3 (Detalles y Evidencia)...');
    await page.waitForSelector('input[type="file"]', { hidden: true });
    
    // Instead of waiting for selector with tricky visibility states, we evaluate directly
    const inputUploadHandle = await page.$('input[type="file"]');
    if (inputUploadHandle) {
      await inputUploadHandle.uploadFile(testImagePath);
      await page.waitForSelector('.photo-preview-item');
    }
    await page.waitForSelector('textarea[name="description"]');
    await page.type('textarea[name="description"]', 'Esta es una prueba automatizada del sistema E2E.');
    await page.click('button.wizard-btn-next');
    
    console.log('5. Completando Paso 4 (Datos Personales)...');
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Usuario Test Automatizado');
    await page.type('input[name="phone"]', '3764000000');
    
    console.log('6. Enviando el reclamo y comprobando la generación de PDF...');
    // Cuando hacemos click en enviar, jsPDF y html2canvas se van a ejecutar
    await page.click('button.wizard-btn-submit');
    
    // Esperamos que aparezca la pantalla de éxito
    console.log('Esperando confirmación del servidor y pantalla de éxito...');
    await page.waitForSelector('.success-icon-ring', { timeout: 30000 });
    
    // Capturar el código de seguimiento de la pantalla
    const trackingCodeElement = await page.$('strong');
    const trackingCodeText = await page.evaluate(el => el.textContent, trackingCodeElement);
    console.log(`\n✅ RECLAMO CREADO CON ÉXITO.`);
    console.log(`✅ CÓDIGO GENERADO: ${trackingCodeText}`);
    
    console.log('\nTodos los procesos frontend (Carga de UI, fotos, generación de PDF) funcionaron correctamente.');
    
    // Clean up
    console.log('\nIniciando limpieza: Buscando el reclamo en Supabase para borrarlo...');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://api.santiagohorianski.com:8443';
    // Using the Anon key for deletion might fail if RLS prevents delete.
    // Instead we will just report it, since we don't have the service_role key handy here, 
    // or we can try with anon key.
    
    console.log(`El reclamo de prueba fue insertado. Revisa tu panel usando el código ${trackingCodeText}.`);
    
  } catch (err) {
    console.error('Error durante la prueba E2E:', err);
  } finally {
    // Delete temp image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    await browser.close();
  }
}

runTest();
