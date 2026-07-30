/* 
====================================================================
 ⚠️ ADVERTENCIA CRÍTICA DE SEGURIDAD Y ARQUITECTURA ⚠️
====================================================================

Actualmente, tu aplicación utiliza "Clerk" para validar quién es el 
administrador (en AdminPanel.jsx), PERO se conecta a "Supabase" usando 
la clave anónima pública (Anon Key). 

Para Supabase, TODOS los que usan la página (sea el vecino o tú como admin) 
son "usuarios anónimos" (rol anon). 

Si activamos el bloqueo total (RLS) en Supabase para que los anónimos 
no puedan borrar o editar datos, ¡TU PANEL DE ADMINISTRADOR DEJARÁ DE FUNCIONAR!, 
porque Supabase no tiene forma de saber que tú ya iniciaste sesión en Clerk.

SOLUCIÓN RECOMENDADA (Paso a paso):
Para blindar realmente tu base de datos, debes conectar Clerk con Supabase. 
1. En el panel de Clerk, ve a "JWT Templates" y crea una para Supabase.
2. En Supabase, en la configuración de JWT, añade la clave de Clerk.
3. En tu código de React, antes de hacer un `.update()` o `.delete()`, 
   debes pedirle el token a Clerk y pasarlo a Supabase mediante:
   `supabase.auth.setSession(token_de_clerk)`

A continuación, dejo el código SQL que DEBES USAR SOLO DESPUÉS de hacer 
esa integración. Si lo ejecutas ahora, tu panel de control no podrá guardar cambios.

====================================================================
*/

-- 1. Activar RLS en las tablas principales
ALTER TABLE municipal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para municipal_reports (Reclamos)
-- Públicos (anon) pueden INSERTAR (crear reclamos) y LEER (ver reclamos).
CREATE POLICY "Permitir insertar a publico" 
ON municipal_reports FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Permitir leer a publico" 
ON municipal_reports FOR SELECT 
TO anon 
USING (true);

-- SOLO LOS AUTENTICADOS (admin con JWT de Clerk) pueden EDITAR o BORRAR
CREATE POLICY "Permitir editar a admin" 
ON municipal_reports FOR UPDATE 
TO authenticated 
USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir borrar a admin" 
ON municipal_reports FOR DELETE 
TO authenticated 
USING (auth.role() = 'authenticated');

-- 3. Políticas para Noticias (Prensa)
-- Públicos solo pueden LEER
CREATE POLICY "Permitir leer noticias a publico" 
ON news FOR SELECT 
TO anon 
USING (true);

-- Solo admin puede CREAR, EDITAR o BORRAR noticias
CREATE POLICY "Permitir todo a admin en noticias" 
ON news FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated');
