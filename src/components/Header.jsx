import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageSquare, Home, BarChart3, FileText, Lock, Sun, Moon, Phone } from 'lucide-react';

export default function Header({ theme, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { id: '/inicio', label: 'Inicio', icon: Home },
    { id: '/proyectos', label: 'Proyectos', icon: FileText },
    { id: '/gestion', label: 'Gestión Territorial', icon: MessageSquare },
    { id: '/noticias', label: 'Noticias y Prensa', icon: FileText },
    { id: '/contacto', label: 'Contacto', icon: Phone }
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="header-nav glass-panel">
      <div className="container header-container">
        {/* Brand / Logo */}
        <Link to="/inicio" className="brand-container" onClick={handleNavClick} style={{ textDecoration: 'none' }}>
          <div className="brand-text">
            <span className="brand-name">Santiago Javier Horianski</span>
            <span className="brand-tagline">
              TU VOTO VALIÓ LA PENA <br />
              ACÁ LAS COSAS SE HACEN.
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="desktop-menu">
          {navItems.map((item) => (
            <NavLink 
              key={item.id}
              to={item.id}
              onClick={handleNavClick}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* CTA Button Desktop */}
        <div className="desktop-cta">
          <Link 
            to="/reclamo" 
            onClick={handleNavClick}
            className="btn btn-primary btn-sm-nav"
            style={{ textDecoration: 'none' }}
          >
            <span>Hacer un Reclamo</span>
          </Link>
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary btn-icon-only"
            aria-label="Alternar Tema"
            style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="mobile-only-flex">
          <button 
            onClick={toggleTheme} 
            className="mobile-theme-toggle"
            aria-label="Alternar Tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer glass-panel ${isOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.id}
              to={item.id}
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} className="mobile-nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <Link 
            to="/admin"
            onClick={handleNavClick}
            className="mobile-nav-link mobile-nav-admin"
            style={{ textDecoration: 'none' }}
          >
            <Lock size={20} className="mobile-nav-icon" />
            <span>Acceso Administrador</span>
          </Link>
        </nav>
        <div className="mobile-drawer-footer">
          <Link 
            to="/reclamo" 
            onClick={handleNavClick}
            className="btn btn-primary btn-block"
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}
          >
            Hacer un Reclamo
          </Link>
        </div>
      </div>

      {/* CSS Styles Local for Header (to avoid CSS bloat but keep files clean) */}
      <style dangerouslySetInnerHTML={{__html: `
        .header-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 1000;
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
          display: flex;
          align-items: center;
          background: var(--glass-bg) !important;
        }
        
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .brand-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .logo-image-container {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          overflow: hidden;
          background: #ffffff;
          border: 2px solid var(--primary);
          box-shadow: 0 0 15px rgba(116, 59, 188, 0.4);
        }

        .logo-character {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.15rem;
          line-height: 1.2;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .brand-tagline {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 500;
          letter-spacing: 0.02em;
          margin-top: 0.1rem;
          line-height: 1.3;
        }

        .desktop-menu {
          display: flex;
          gap: 0.5rem;
        }

        .nav-link {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--overlay-light);
        }

        .nav-link.active {
          color: var(--primary);
          background: rgba(217, 160, 36, 0.08);
          font-weight: 600;
          box-shadow: inset 0 0 0 1px rgba(217, 160, 36, 0.2);
        }

        .btn-sm-nav {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          border-radius: 8px;
        }

        .mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        .mobile-only-flex {
          display: none;
        }

        .mobile-theme-toggle {
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-drawer {
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          background: var(--bg-dark) !important;
          border-top: none;
          border-radius: 0 0 16px 16px;
          display: none;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 10px;
          font-size: 1.05rem;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          text-align: left;
          min-height: 48px;
        }

        .mobile-nav-link:hover {
          color: var(--text-primary);
          background: var(--overlay-light);
        }

        .mobile-nav-link.active {
          color: var(--primary);
          background: rgba(217, 160, 36, 0.1);
          font-weight: 600;
        }

        .btn-full-width {
          width: 100%;
        }

        .desktop-cta {
          display: flex;
          align-items: center;
        }

        @media (max-width: 768px) {
          .desktop-menu, .desktop-cta {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
          .mobile-only-flex {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .mobile-drawer {
            display: block;
            opacity: 0;
            transform: translateY(-20px);
            pointer-events: none;
          }
          .mobile-drawer.open {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }
        }

        @media (max-width: 480px) {
          .brand-name {
            font-size: 0.85rem;
          }
          .brand-tagline {
            font-size: 0.50rem;
            letter-spacing: 0.01em;
          }
          .logo-image-container {
            width: 40px;
            height: 40px;
          }
          .brand-container {
            gap: 0.5rem;
          }
        }
      `}} />
    </header>
  );
}
