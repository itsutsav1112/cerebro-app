import React, { useState, useRef, useEffect } from 'react';

const GROQ_KEY = process.env.REACT_APP_GROQ_KEY;

async function callGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages,
      max_tokens: 300,
      temperature: 0.7
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
}

const SYSTEM = `You are Cerebro — a sharp, warm CAT prep coach. You combine the wisdom of a career counsellor, sports psychologist, and CAT expert. You work on exam skills and mental game naturally. Be direct, conversational, under 120 words unless solving a specific problem. No bullet points. Sound like a smart friend who knows CAT inside out.`;

export default function Coach({user}) {
  const name = user?.name || '';
  const [messages,setMessages]=useState([
    {role:'assistant',content:`Hey${name?` ${name}`:''}. I'm your Cerebro coach. Ask me anything — exam strategy, a concept you're stuck on, how to improve a section, or just how you're feeling about prep. What's on your mind?`}
  ]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const bottomRef=useRef(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const text=input.trim();
    setInput('');
    setError('');
    const newMessages=[...messages,{role:'user',content:text}];
    setMessages(newMessages);
    setLoading(true);
    try{
      const apiMessages=[
        {role:'system',content:SYSTEM},
        ...newMessages.map(m=>({role:m.role,content:m.content}))
      ];
      const reply=await callGroq(apiMessages);
      setMessages([...newMessages,{role:'assistant',content:reply}]);
    }catch(e){
      setError('Connection issue. Check your internet and try again.');
      setMessages(newMessages);
    }
    setLoading(false);
  };

  const quickReplies=[
    "How do I eliminate options in VARC?",
    "Best DILR strategy",
    "I'm feeling anxious about CAT",
    "How many questions should I attempt?"
  ];

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'var(--bg)'}}>
      <div style={{padding:'1rem 1.25rem 0.5rem',borderBottom:'0.5px solid var(--surface3)'}}>
        <div style={{fontFamily:'var(--serif)',fontSize:'13px',fontWeight:'700',letterSpacing:'0.18em',color:'var(--gold)',textTransform:'uppercase'}}>Coach</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1rem 1.25rem',display:'flex',flexDirection:'column',gap:'12px'}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-end',flexDirection:m.role==='user'?'row-reverse':'row'}}>
            {m.role==='assistant'&&<div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--gold-dim)',border:'0.5px solid var(--gold-border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'600',color:'var(--gold)',flexShrink:0}}>C</div>}
            <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:'16px',fontSize:'13.5px',lineHeight:'1.6',background:m.role==='user'?'var(--gold)':'var(--surface)',color:m.role==='user'?'#0A0A0F':'var(--text)',border:m.role==='user'?'none':'0.5px solid var(--surface3)',borderBottomRightRadius:m.role==='user'?'4px':'16px',borderBottomLeftRadius:m.role==='assistant'?'4px':'16px',fontWeight:m.role==='user'?'500':'400'}}>{m.content}</div>
          </div>
        ))}
        {loading&&(
          <div style={{display:'flex',gap:'8px',alignItems:'flex-end'}}>
            <div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--gold-dim)',border:'0.5px solid var(--gold-border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'var(--gold)',flexShrink:0}}>C</div>
            <div style={{padding:'10px 14px',borderRadius:'16px',background:'var(--surface)',border:'0.5px solid var(--surface3)',display:'flex',gap:'4px',alignItems:'center'}}>
              {[0,1,2].map(i=><div key={i} style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--gold)',opacity:0.5,animation:`bounce 1.2s infinite ${i*0.2}s`}}></div>)}
              <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
            </div>
          </div>
        )}
        {error&&<div style={{fontSize:'12px',color:'#E24B4A',textAlign:'center',padding:'8px'}}>{error}</div>}
        {messages.length===1&&(
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'4px'}}>
            {quickReplies.map((q,i)=>(
              <div key={i} onClick={()=>{setInput(q);}} style={{fontSize:'12px',padding:'6px 12px',borderRadius:'100px',background:'var(--surface)',border:'0.5px solid var(--hint)',color:'var(--muted)',cursor:'pointer'}}>
                {q}
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:'0.75rem 1.25rem 1rem',borderTop:'0.5px solid var(--surface3)',display:'flex',gap:'8px',alignItems:'flex-end',background:'var(--surface)'}}>
        <textarea
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Ask your coach anything..."
          rows={1}
          style={{flex:1,background:'var(--bg)',border:'0.5px solid var(--hint)',borderRadius:'12px',padding:'10px 14px',fontFamily:'var(--body)',fontSize:'13.5px',color:'var(--text)',resize:'none',outline:'none',lineHeight:'1.4',maxHeight:'100px'}}
        />
        <button onClick={send} disabled={loading||!input.trim()} style={{width:'40px',height:'40px',borderRadius:'12px',background:loading||!input.trim()?'rgba(201,150,58,0.3)':'var(--gold)',border:'none',cursor:loading||!input.trim()?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="#0A0A0F"><path d="M2 10L18 2 12 18 10 11z"/></svg>
        </button>
      </div>
    </div>
  );
}