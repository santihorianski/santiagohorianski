import React, { useEffect } from 'react';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-container container" style={{ padding: '6rem 1rem 4rem', maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(217, 160, 36, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Shield size={48} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Políticas de Privacidad
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Protección de Datos Personales en Argentina
          </p>
        </div>

        <div className="privacy-content" style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
          
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '1rem' }}>
              <FileText size={24} color="var(--primary)" />
              1. Marco Legal (Ley 25.326)
            </h2>
            <p>
              El tratamiento de los datos personales recopilados a través de la plataforma <strong>Buzón Ciudadano</strong> se realiza en estricto cumplimiento con la <strong>Ley de Protección de los Datos Personales N° 25.326</strong> de la República Argentina, su Decreto Reglamentario N° 1558/2001 y las disposiciones emitidas por la Agencia de Acceso a la Información Pública.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '1rem' }}>
              <Lock size={24} color="var(--primary)" />
              2. Confidencialidad y Seguridad
            </h2>
            <p>
              Garantizamos la absoluta confidencialidad y reserva de la información brindada por los ciudadanos. Los datos de contacto proporcionados en los reportes (teléfono, correo electrónico o nombre) se utilizan exclusivamente para:
            </p>
            <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginTop: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={18} color="var(--secondary)" style={{ marginTop: '0.3rem', flexShrink: 0 }} />
                <span>Notificar el estado de avance del reclamo o proyecto.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={18} color="var(--secondary)" style={{ marginTop: '0.3rem', flexShrink: 0 }} />
                <span>Validar la veracidad de la ubicación en caso de requerir más información para la gestión municipal.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={18} color="var(--secondary)" style={{ marginTop: '0.3rem', flexShrink: 0 }} />
                <span>Los reportes marcados como "Anónimos" ocultan la identidad públicamente, resguardando al denunciante en todo momento.</span>
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '1rem' }}>
              <Shield size={24} color="var(--primary)" />
              3. Derechos de los Titulares
            </h2>
            <p>
              El titular de los datos personales tiene la facultad de ejercer el <strong>derecho de acceso</strong> a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto (artículo 14, inciso 3 de la Ley N° 25.326).
            </p>
            <p style={{ marginTop: '1rem' }}>
              Asimismo, asiste al titular el derecho de solicitar la <strong>rectificación, actualización o supresión</strong> de sus datos personales incluidos en nuestras bases de datos. Para ejercer estos derechos, el ciudadano podrá comunicarse mediante nuestros canales oficiales de contacto.
            </p>
          </section>

          <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--overlay-light)', borderRadius: '12px', border: '1px solid var(--overlay-medium)', fontSize: '0.9rem' }}>
            <p>
              <strong>Agencia de Acceso a la Información Pública:</strong><br/>
              Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
