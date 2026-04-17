import React, { useState, useEffect } from 'react';
import Onboarding from './screens/Onboarding';
import Learn from './screens/Learn';
import Coach from './screens/Coach';
import Profile from './screens/Profile';

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('learn');

  useEffect(() => {
    const stored = localStorage.getItem('cerebro_user');
    if (stored) {
      setUser(JSON.parse(stored));
      setScreen('main');
    } else {
      setScreen('onboarding');
    }
  }, []);

  const onOnboardingComplete = (userData) => {
    localStorage.setItem('cerebro_user', JSON.stringify(userData));
    setUser(userData);
    setScreen('main');
  };

  if (screen === 'loading') return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0A0A0F'}}>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:'32px',fontWeight:'800',color:'#C9963A'}}>C</div>
    </div>
  );

  if (screen === 'onboarding') return <Onboarding onComplete={onOnboardingComplete} />;

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#0A0A0F'}}>
      <div style={{flex:1,overflowY:'auto'}}>
        {tab === 'learn' && <Learn user={user} />}
        {tab === 'coach' && <Coach user={user} />}
        {tab === 'profile' && <Profile user={user} />}
      </div>
      <nav style={{display:'flex',borderTop:'0.5px solid #22222E',background:'#12121A',padding:'8px 0 20px',position:'sticky',bottom:0}}>
        {[{id:'learn',label:'Learn'},{id:'coach',label:'Coach'},{id:'profile',label:'Profile'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{flex:1,background:'none',border:'none',cursor:'pointer',padding:'8px 0',fontFamily:'Inter,sans-serif',fontSize:'12px',color:tab===t.id?'#C9963A':'#888780',fontWeight:tab===t.id?'500':'400'}}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}