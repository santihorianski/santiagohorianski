import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { Shield, Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SecretSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage('Administrador creado correctamente. Por favor revisa tu correo para confirmar la cuenta si es necesario, o ya puedes ir a Iniciar Sesión.');
    } catch (error) {
      console.error('Error signing up:', error);
      setStatus('error');
      setMessage(error.message || 'Error al crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '2rem' }}>
      <Helmet>
        <title>Registro Secreto | Buzón Ciudadano</title>
      </Helmet>
      
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--overlay-light)', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', background: 'rgba(116, 59, 188, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <Shield size={30} style={{ color: 'var(--primary)' }} />
        </div>
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Registro de Administrador</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Ingresa tus datos para crear la cuenta maestra en Supabase. Una vez creada, avísale al sistema para desactivar esta pantalla.
        </p>

        {status === 'success' ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <CheckCircle size={40} style={{ color: 'var(--success)', margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--success)', fontWeight: '600', marginBottom: '1rem' }}>¡Cuenta Creada!</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{message}</p>
            <a href="/admin" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Ir al Panel Admin</a>
          </div>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {status === 'error' && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} />
                <span>{message}</span>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input" 
                  placeholder="admin@santiagohorianski.com"
                  style={{ paddingLeft: '2.8rem', background: 'var(--bg-dark)' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contraseña Segura</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input" 
                  placeholder="••••••••••••"
                  style={{ paddingLeft: '2.8rem', background: 'var(--bg-dark)' }}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem' }}>
              {isLoading ? 'Creando cuenta...' : 'Crear Administrador'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
