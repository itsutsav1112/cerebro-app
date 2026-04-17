import React, { useState, useEffect } from 'react';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Learn from './screens/Learn';
import Coach from './screens/Coach';
import Profile from './screens/Profile';
import { supabase } from './supabase';

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
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
      <div style={{fontFamily:'var(--serif)',fontSize:'32px',fontWeight:'800',color:'var(--gold)'}}>C</div>
    </div>
  );

  if (screen === 'onboarding') return <Onboarding onComplete={onOnboardingComplete} />;

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <div style={{flex:1,overflowY:'auto'}}>
        {tab === 'learn' && <Learn user={user} />}
        {tab === 'coach' && <Coach user={user} />}
        {tab === 'profile' && <Profile user={user} />}
      </div>
      <nav style={{
        display:'flex',borderTop:'0.5px solid var(--surface3)',
        background:'var(--surface)',padding:'8px 0 20px'
      }}>
        {[
          {id:'learn',label:'Learn'},
          {id:'coach',label:'Coach'},
          {id:'profile',label:'Profile'}
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1,background:'none',border:'none',cursor:'pointer',
            padding:'8px 0',fontFamily:'var(--body)',fontSize:'12px',
            color: tab === t.id ? 'var(--gold)' : 'var(--muted)',
            fontWeight: tab === t.id ? '500' : '400'
          }}>{t.label}</button>
        ))}
      </nav>
    </div>
  );
}
