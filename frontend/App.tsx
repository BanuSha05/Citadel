import React, { useState } from 'react';
import { Shield, MapPin, Tent, CloudSun, ShieldCheck, ArrowRight, Activity, Menu, X } from 'lucide-react';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { FinalResultsView } from './components/results/FinalResultsView';
import { MyDesigns } from './components/dashboard/MyDesigns';
import { CompareDesigns } from './components/dashboard/CompareDesigns';
import { DesignSummary } from './components/dashboard/DesignSummary';
import { ShelterProvider, useShelter } from './context/ShelterContext';
import './index.css';
import './App.css';
import './mobile.css';

function AppContent() {
  const [view, setView] = useState<'home' | 'onboarding' | 'final-results' | 'my-designs' | 'summary' | 'compare'>('home');
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const { design, saveDesign } = useShelter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (view === 'onboarding') {
    return <OnboardingFlow onCancel={() => setView('home')} onFinish={() => {
      saveDesign('Completed via Design Flow');
      setView('final-results');
    }} />;
  }

  if (view === 'final-results') {
    return <FinalResultsView onBack={() => setView('onboarding')} />;
  }

  if (view === 'my-designs') {
    return <MyDesigns onBack={() => setView('home')} onLoadDesign={() => setView('final-results')} onCompare={() => setView('compare')} />;
  }

  if (view === 'compare') {
    return <CompareDesigns onBack={() => setView('my-designs')} onLoadDesign={() => setView('final-results')} />;
  }

  if (view === 'summary') {
    return <DesignSummary onBack={() => setView('final-results')} />;
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', position: 'relative' }}>
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield className="nav-brand-icon" size={28} />
          <span style={{ fontWeight: 600 }}>CITADEL</span>
        </div>

        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#home" onClick={(e) => { e.preventDefault(); setView('home'); closeMobileMenu(); }}>Home</a>
          <a href="#design" onClick={(e) => { e.preventDefault(); sessionStorage.removeItem('locationConfirmed'); setView('onboarding'); closeMobileMenu(); }}>Design Shelter</a>
          <a href="#designs" onClick={(e) => { e.preventDefault(); setView('my-designs'); closeMobileMenu(); }}>My Designs</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); closeMobileMenu(); }}>About</a>
          
          <div className="offline-status" title="Location: Device/Manual&#10;Compass: Device/Manual&#10;Climate: Local&#10;Thermal Engine: Local&#10;Optimization: Local" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.75rem', color: '#10b981', cursor: 'help', marginLeft: '1rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
            Offline Mode
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <img 
          src="/citadel_hero_bg.jpg" 
          alt="Snow mountain landscape with futuristic shelter" 
          className="hero-bg" 
        />
        <div className="hero-overlay"></div>
        <div className="hero-content glass-panel">
          <h1 className="hero-title">
            <span className="text-gradient">Build for the place.</span><br/>
            Built for the people.
          </h1>
          <p className="hero-subtitle">
            CITADEL helps you explore climate-suitable shelter designs using your location, needs and available materials.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => { sessionStorage.removeItem('locationConfirmed'); setView('onboarding'); }}>Start Designing</button>
            <button className="btn-secondary">Explore How It Works</button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="design" className="features-section">
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper">
            <MapPin size={32} />
          </div>
          <h3 className="feature-title">Choose Your Place</h3>
          <p style={{ color: 'var(--color-text-light)' }}>
            Simply select where you are. We'll handle the climate data automatically.
          </p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper">
            <Tent size={32} />
          </div>
          <h3 className="feature-title">Tell Us Your Needs</h3>
          <p style={{ color: 'var(--color-text-light)' }}>
            How many people? What materials do you have? Just a few simple questions.
          </p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon-wrapper">
            <Activity size={32} />
          </div>
          <h3 className="feature-title">Get Your Design</h3>
          <p style={{ color: 'var(--color-text-light)' }}>
            Receive a beautiful, ready-to-build shelter design optimized for comfort.
          </p>
        </div>
      </section>

      {/* How CITADEL works */}
      <section id="about" className="how-it-works">
        <h2 className="section-title text-gradient">How CITADEL Works</h2>
        <div className="flow-container">
          <div className="flow-step">
            <div className="step-circle">1</div>
            <div className="step-label">Location</div>
          </div>
          <ArrowRight className="flow-arrow" size={24} />
          <div className="flow-step">
            <div className="step-circle">2</div>
            <div className="step-label">Your Needs</div>
          </div>
          <ArrowRight className="flow-arrow" size={24} />
          <div className="flow-step">
            <div className="step-circle">3</div>
            <div className="step-label">Shelter Design</div>
          </div>
          <ArrowRight className="flow-arrow" size={24} />
          <div className="flow-step">
            <div className="step-circle">4</div>
            <div className="step-label">Thermal Comfort</div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="trust-content">
          <ShieldCheck className="trust-icon" size={64} />
          <h2 className="trust-text">Designed for remote and challenging environments</h2>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} CITADEL. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ShelterProvider>
      <AppContent />
    </ShelterProvider>
  );
}

export default App;
