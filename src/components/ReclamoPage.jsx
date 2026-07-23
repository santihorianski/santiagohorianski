import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FormularioReclamosVecinales from './FormularioReclamosVecinales';

export default function ReclamoPage({ onSubmitReport }) {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/gestion');
  };

  const handleSubmit = (data) => {
    onSubmitReport(data);
    // Let the form show its own internal success screen
  };

  return (
    <>
      <Helmet>
        <title>Nuevo Reclamo | Buzón Ciudadano</title>
      </Helmet>
      <div style={{ paddingTop: '100px', paddingBottom: '4rem', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div className="container">
          <FormularioReclamosVecinales 
            onSubmitReport={handleSubmit} 
            onClose={handleClose} 
            isStandalone={true} 
          />
        </div>
      </div>
    </>
  );
}
