import React from 'react';

export default function WhatsAppButton() {
  const phoneNumber = "5493764515738"; // Número oficial
  const message = encodeURIComponent("¡Hola Santiago! Estuve viendo la plataforma y quiero sumarme a colaborar.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <>
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float"
        aria-label="Contactar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.082 21.365c-1.503-.001-2.973-.4-4.26-1.155l-4.733 1.242 1.267-4.615c-.83-1.317-1.269-2.836-1.268-4.398.002-4.606 3.75-8.354 8.361-8.354 4.608 0 8.356 3.748 8.356 8.354 0 4.607-3.751 8.355-8.356 8.355-.055.001-.11.001-.167.001z"/>
        </svg>
      </a>

      <style dangerouslySetInnerHTML={{__html: `
        .whatsapp-float {
          position: fixed;
          width: 60px;
          height: 60px;
          bottom: 30px;
          right: 30px;
          background-color: #25d366;
          color: #FFF;
          border-radius: 50px;
          text-align: center;
          font-size: 30px;
          box-shadow: 0 6px 15px rgba(37, 211, 102, 0.4);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .whatsapp-float:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 8px 25px rgba(37, 211, 102, 0.6);
          background-color: #20b858;
        }

        /* Pulse Animation */
        .whatsapp-float::before {
          content: '';
          position: absolute;
          z-index: -1;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          display: block;
          width: 60px;
          height: 60px;
          background: #25d366;
          border-radius: 50%;
          animation: pulse-border 2s ease-out infinite;
        }

        @keyframes pulse-border {
          0% {
            transform: translateX(-50%) translateY(-50%) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateX(-50%) translateY(-50%) scale(1.5);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .whatsapp-float {
            width: 50px;
            height: 50px;
            bottom: 20px;
            right: 20px;
          }
          .whatsapp-float svg {
            width: 24px;
            height: 24px;
          }
        }
      `}} />
    </>
  );
}
