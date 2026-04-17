import React, { useState, useEffect, useRef } from 'react';

const PUZZLES = [
  {q:"A is the brother of B. B is the sister of C. C is the father of D. How is A related to D?",opts:["Uncle","Father","Brother","Cousin"],correct:0},
  {q:"5 people sit in a row. Raj is left of Priya but right of Meera. Kiran is right of Priya. Asha is at one end. Who is in the middle?",opts:["Raj","Priya","Meera","Kiran"],correct:1},
  {q:"If every letter in SHARP shifts +2 positions forward in the alphabet, what does SHARP become?",opts:["UJCTO","UJBSS","UICRQ","VKDTP"],correct:0}
];

const COLLEGES = [
  {name:'IIM Ahmedabad',pct:'99.5+'},
  {name:'IIM Bangalore',pct:'99+'},
  {name:'IIM Calcutta',pct:'99+'},
  {name:'IIM Lucknow',pct:'97+'},
  {name:'IIM Kozhikode',pct:'95+'},
  {name:'XLRI Jamshedpur',pct:'95+'},
  {name:'MDI Gurgaon',pct:'93+'},
  {name:'IIM Indore',pct:'97+'},
];

function calcDays() {
  const catDate = new Date(2026, 10, 29);
  return Math.max(0, Math.ceil((catDate - new Date()) / (1000*60*60*24)));
}

function getPersona(puzzleScores, mindset, tier) {
  const correct = puzzleScores.filter(p => p.correct).length;
  const score = Math.round((correct / 3) * 100);
  const anxious = mindset.filter(m => m && (m.includes('anxious') || m.includes('rattles') || m.includes('try not'))).length;
  const confident = mindset.filter(m => m && (m.includes('rush') || m.includes('Interesting') || m.includes('Attack'))).length;
  const avgTime = puzzleScores.length ? Math.round(puzzleScores.reduce((a,b) => a+b.time,0) / puzzleScores.length) : 0;
  let persona, coachNote, startStage;
  if(score>=67&&confident>=2){persona='Natural Competitor';coachNote="You think fast and back yourself. Starting at Stage 2 — no hand-holding.";startStage=2;}
  else if(score>=67&&anxious>=1){persona='Undercover Analyst';coachNote="Your brain moves faster than your confidence. We fix that first.";startStage=1;}
  else if(score>=33&&confident>=1){persona='Strategic Climber';coachNote="Good instincts, needs a system. Concept first, speed second.";startStage=1;}
  else if(score>=33){persona='Honest Warrior';coachNote="Showing up is the first move. We go deep before we go fast.";startStage=1;}
  else{persona='Raw Talent';coachNote="Unpolished but capable. Sharpness training before syllabus.";startStage=1;}
  const tierNames=['Blank Slate','Rusty but Ready','Mid-Way Warrior','The Strategist','The Natural'];
  if(tier>=3)startStage=Math.min(startStage+1,3);
  return{persona,coachNote,startStage,sharpScore:score,avgTime,tierLabel:tierNames[tier]||'Blank Slate',correctCount:correct};
}

export default function Onboarding({onComplete}) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState('');
  const [why,setWhy]=useState(null);
  const [mindset,setMindset]=useState([null,null,null]);
  const [tier,setTier]=useState(null);
  const [puzzleIdx,setPuzzleIdx]=useState(0);
  const [puzzleScores,setPuzzleScores]=useState([]);
  const [pAnswered,setPAnswered]=useState(false);
  const [timer,setTimer]=useState(0);
  const [otherText,setOtherText]=useState('');
  const timerRef=useRef(null);
  const startRef=useRef(null);
  const days=calcDays();

  useEffect(()=>{
    if(step===4){
      setTimer(0);setPAnswered(false);
      startRef.current=Date.now();
      timerRef.current=setInterval(()=>setTimer(Math.floor((Date.now()-startRef.current)/1000)),1000);
    }
    return()=>clearInterval(timerRef.current);
  },[step,puzzleIdx]);

  const answerPuzzle=(idx)=>{
    if(pAnswered)return;
    setPAnswered(true);
    clearInterval(timerRef.current);
    const elapsed=Math.floor((Date.now()-startRef.current)/1000);
    const correct=idx===PUZZLES[puzzleIdx].correct;
    const newScores=[...puzzleScores,{correct,time:elapsed}];
    setPuzzleScores(newScores);
    setTimeout(()=>{
      if(puzzleIdx+1<PUZZLES.length){setPuzzleIdx(puzzleIdx+1);setPAnswered(false);}
      else setStep(5);
    },800);
  };

  const finish=()=>{
    const persona=getPersona(puzzleScores,mindset,tier||0);
    const userData={name,why,mindset,tier,puzzleScores,persona,daysToCAT:days,attempts:[],sessionCount:0,streak:0,lastSeen:new Date().toISOString()};
    onComplete(userData);
  };

  const S={padding:'1.5rem 1.25rem',minHeight:'100vh',display:'flex',flexDirection:'column',background:'var(--bg)'};
  const Brand=()=><div style={{fontFamily:'var(--serif)',fontSize:'13px',fontWeight:'700',letterSpacing:'0.18em',color:'var(--gold)',textTransform:'uppercase',marginBottom:'2rem'}}>Cerebro</div>;
  const Progress=({pct})=><div style={{height:'2px',background:'var(--surface3)',borderRadius:'100px',marginBottom:'1.5rem'}}><div style={{height:'100%',width:pct+'%',background:'var(--gold)',borderRadius:'100px',transition:'width 0.4s'}}></div></div>;
  const StepLabel=({n})=><div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--gold)',fontWeight:'500',marginBottom:'0.5rem'}}>Step {n} of 7</div>;
  const Btn=({label,onClick,disabled=false})=><button disabled={disabled} onClick={onClick} style={{background:disabled?'rgba(201,150,58,0.3)':'var(--gold)',color:'#0A0A0F',border:'none',borderRadius:'var(--r)',padding:'15px',fontFamily:'var(--serif)',fontSize:'15px',fontWeight:'700',cursor:disabled?'default':'pointer',width:'100%',marginTop:'auto',opacity:disabled?0.4:1}}>{label}</button>;

  // STEP 0: SPLASH
  if(step===0)return(
    <div style={{...S,justifyContent:'center',alignItems:'center',textAlign:'center'}}>
      <Brand/>
      <div style={{fontFamily:'var(--serif)',fontSize:'56px',fontWeight:'800',color:'var(--gold)',lineHeight:'1',marginBottom:'0.5rem'}}>C</div>
      <div style={{fontFamily:'var(--serif)',fontSize:'22px',fontWeight:'700',color:'var(--text)',marginBottom:'0.5rem'}}>Find your 99.</div>
      <div style={{fontSize:'13px',color:'var(--muted)',marginBottom:'3rem',lineHeight:'1.6'}}>The AI that thinks like you,<br/>trains harder than you.</div>
      <div style={{background:'var(--gold-dim)',border:'0.5px solid var(--gold-border)',borderRadius:'var(--r)',padding:'14px 18px',marginBottom:'2rem',display:'flex',alignItems:'center',gap:'14px',width:'100%'}}>
        <div style={{fontFamily:'var(--serif)',fontSize:'36px',fontWeight:'800',color:'var(--gold)'}}>{days}</div>
        <div style={{fontSize:'12px',color:'var(--muted)',lineHeight:'1.4'}}>
          <strong style={{color:'var(--text)',display:'block',fontSize:'13px'}}>days to CAT 2026</strong>
          November 29, 2026. Closer than you think.
        </div>
      </div>
      <Btn label="Let's go →" onClick={()=>setStep(1)}/>
    </div>
  );

  // STEP 1: NAME
  if(step===1)return(
    <div style={S}>
      <Brand/><Progress pct={10}/>
      <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--gold)',fontWeight:'500',marginBottom:'0.5rem'}}>Step 1 of 7</div>
      <div style={{fontFamily:'var(--serif)',fontSize:'38px',fontWeight:'800',lineHeight:'1.05',color:'var(--text)',marginBottom:'0.75rem'}}>First things<br/>first.</div>
      <div style={{fontSize:'14px',color:'var(--muted)',lineHeight:'1.65',marginBottom:'2rem'}}>What do we call you?</div>
      <input
        type="text"
        value={name}
        onChange={e=>setName(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter'&&name.trim().length>0)setStep(2);}}
        placeholder="Your name"
        autoFocus
        style={{background:'var(--surface)',border:'0.5px solid var(--hint)',borderRadius:'var(--r)',padding:'16px',fontFamily:'var(--body)',fontSize:'16px',color:'var(--text)',width:'100%',outline:'none',marginBottom:'1rem'}}
      />
      <Btn label="Continue →" onClick={()=>setStep(2)} disabled={name.trim().length===0}/>
    </div>
  );

  // STEP 2: WHY
  if(step===2){
    const opts=[
      {label:'I want a top MBA',sub:'IIM A/B/C is the goal'},
      {label:'Career change — I need this',sub:"Current job isn't it"},
      {label:'Proving something to myself',sub:'Personal milestone'},
      {label:'Family / expectations',sub:'Being honest here'},
      {label:'Something else',sub:'',other:true}
    ];
    return(
      <div style={S}>
        <Brand/><Progress pct={24}/><StepLabel n={2}/>
        <div style={{fontFamily:'var(--serif)',fontSize:'38px',fontWeight:'800',lineHeight:'1.05',color:'var(--text)',marginBottom:'0.75rem'}}>What brings<br/>you here,<br/>{name.trim()}?</div>
        <div style={{fontSize:'14px',color:'var(--muted)',lineHeight:'1.65',marginBottom:'1.5rem'}}>No wrong answers. This shapes everything.</div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'1.5rem'}}>
          {opts.map((o,i)=>(
            <div key={i} onClick={()=>setWhy(o.label)} style={{background:why===o.label?'var(--gold-dim)':'var(--surface)',border:`${why===o.label?'1px':'0.5px'} solid ${why===o.label?'var(--gold)':'var(--hint)'}`,borderRadius:'var(--r)',padding:'14px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:'18px',height:'18px',borderRadius:'50%',border:'1px solid',borderColor:why===o.label?'var(--gold)':'var(--hint)',flexShrink:0,background:why===o.label?'var(--gold)':'transparent'}}></div>
              <div style={{flex:1}}>
                <div style={{fontSize:'14px',color:'var(--text)'}}>{o.label}</div>
                {o.sub&&<div style={{fontSize:'11px',color:'var(--muted)',marginTop:'2px'}}>{o.sub}</div>}
                {o.other&&why===o.label&&<textarea value={otherText} onChange={e=>setOtherText(e.target.value)} placeholder="Tell us..." style={{background:'transparent',border:'0.5px solid var(--hint)',borderRadius:'var(--r-sm)',padding:'8px',fontSize:'12px',color:'var(--text)',width:'100%',marginTop:'8px',resize:'none',outline:'none'}} rows={2}/>}
              </div>
            </div>
          ))}
        </div>
        <Btn label="Continue →" onClick={()=>setStep(3)} disabled={!why}/>
      </div>
    );
  }

  // STEP 3: MINDSET
  if(step===3){
    const qs=[
      {q:"When you think about CAT day, what's your gut reaction?",opts:["I get a rush — bring it on","Nervous, but I'll manage","Honestly, quite anxious","I try not to think about it"]},
      {q:"You get a question wrong. Your first thought?",opts:["Interesting — why did I miss that?","It happens, move on","I get frustrated with myself","It rattles me for the next few questions"]},
      {q:"How do you handle a subject you find genuinely hard?",opts:["Attack it — that's where the marks are","Work on it steadily","Avoid it and focus on strengths","Overthink it and lose time"]}
    ];
    return(
      <div style={S}>
        <Brand/><Progress pct={38}/><StepLabel n={3}/>
        <div style={{fontFamily:'var(--serif)',fontSize:'38px',fontWeight:'800',lineHeight:'1.05',color:'var(--text)',marginBottom:'0.75rem'}}>Quick check,<br/>{name.trim()}.</div>
        <div style={{fontSize:'14px',color:'var(--muted)',lineHeight:'1.65',marginBottom:'1.5rem'}}>Answer instinctively. No right or wrong.</div>
        <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'1.5rem'}}>
          {qs.map((q,qi)=>(
            <div key={qi} style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'14px 16px'}}>
              <div style={{fontSize:'13px',color:'var(--text)',marginBottom:'10px',lineHeight:'1.5'}}>{q.q}</div>
              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                {q.opts.map((o,oi)=>(
                  <div key={oi} onClick={()=>{const m=[...mindset];m[qi]=o;setMindset(m);}} style={{background:mindset[qi]===o?'var(--gold-dim)':'var(--surface2)',border:`0.5px solid ${mindset[qi]===o?'var(--gold)':'var(--hint)'}`,borderRadius:'var(--r-sm)',padding:'8px 12px',cursor:'pointer',fontSize:'13px',color:'var(--text)'}}>{o}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Btn label="Continue →" onClick={()=>setStep(4)} disabled={mindset.filter(x=>x).length<3}/>
      </div>
    );
  }

  // STEP 4: TIER
  if(step===4){
    const tiers=[
      {name:'Blank Slate',desc:'0 prep — just curious about CAT'},
      {name:'Rusty but Ready',desc:'Know the basics, need to polish'},
      {name:'Mid-Way Warrior',desc:'Intermediate — seen these patterns before'},
      {name:'The Strategist',desc:'Quite a lot — fine-tuning my speed'},
      {name:'The Natural',desc:'I know everything — give me the hardest stuff'}
    ];
    return(
      <div style={S}>
        <Brand/><Progress pct={52}/><StepLabel n={4}/>
        <div style={{fontFamily:'var(--serif)',fontSize:'38px',fontWeight:'800',lineHeight:'1.05',color:'var(--text)',marginBottom:'0.75rem'}}>Where are<br/>you right now?</div>
        <div style={{fontSize:'14px',color:'var(--muted)',lineHeight:'1.65',marginBottom:'1.5rem'}}>Be honest. The AI adjusts either way.</div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'1.5rem'}}>
          {tiers.map((t,i)=>(
            <div key={i} onClick={()=>setTier(i)} style={{background:tier===i?'var(--gold-dim)':'var(--surface)',border:`${tier===i?'1px':'0.5px'} solid ${tier===i?'var(--gold)':'var(--hint)'}`,borderRadius:'var(--r)',padding:'14px 16px',cursor:'pointer'}}>
              <div style={{fontSize:'13px',fontWeight:'500',color:'var(--text)',marginBottom:'2px'}}>{t.name}</div>
              <div style={{fontSize:'11px',color:'var(--muted)'}}>{t.desc}</div>
            </div>
          ))}
        </div>
        <Btn label="Continue →" onClick={()=>setStep(5)} disabled={tier===null}/>
      </div>
    );
  }

  // STEP 5: PUZZLES
  if(step===5){
    const p=PUZZLES[puzzleIdx];
    return(
      <div style={S}>
        <Brand/><Progress pct={66}/>
        <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--gold)',fontWeight:'500',marginBottom:'0.5rem'}}>Step 5 of 7 — Sharpness Sprint</div>
        <div style={{fontFamily:'var(--serif)',fontSize:'20px',fontWeight:'700',color:'var(--text)',marginBottom:'0.4rem'}}>3 quick puzzles.</div>
        <div style={{fontSize:'13px',color:'var(--muted)',marginBottom:'1.25rem',lineHeight:'1.5'}}>No CAT knowledge needed. Just raw thinking. We're reading how your mind works.</div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
          <span style={{fontSize:'11px',color:'var(--muted)'}}>Puzzle {puzzleIdx+1} of 3</span>
          <span style={{fontSize:'11px',color:'var(--gold)'}}>{timer}s</span>
        </div>
        <div style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'18px',marginBottom:'14px'}}>
          <div style={{fontSize:'14px',lineHeight:'1.7',color:'var(--text)',marginBottom:'14px'}}>{p.q}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {p.opts.map((o,i)=>(
              <div key={i} onClick={()=>answerPuzzle(i)} style={{background:'var(--surface2)',border:'0.5px solid var(--hint)',borderRadius:'var(--r-sm)',padding:'10px 12px',cursor:'pointer',fontSize:'13px',color:'var(--text)',textAlign:'center',opacity:pAnswered?0.6:1}}>{o}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 6: SPRINT RESULTS
  if(step===6){
    const correct=puzzleScores.filter(p=>p.correct).length;
    const totalTime=puzzleScores.reduce((a,b)=>a+b.time,0);
    const avgTime=Math.round(totalTime/puzzleScores.length);
    return(
      <div style={S}>
        <Brand/><Progress pct={80}/>
        <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--gold)',fontWeight:'500',marginBottom:'0.5rem'}}>Step 6 of 7 — Your Sprint Results</div>
        <div style={{fontFamily:'var(--serif)',fontSize:'32px',fontWeight:'800',lineHeight:'1.05',color:'var(--text)',marginBottom:'1.25rem'}}>Here's how<br/>you did.</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'1.25rem'}}>
          <div style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'14px'}}>
            <div style={{fontFamily:'var(--serif)',fontSize:'36px',fontWeight:'800',color:correct===3?'#1D9E75':correct>=2?'var(--gold)':'#E24B4A'}}>{correct}/3</div>
            <div style={{fontSize:'11px',color:'var(--muted)',marginTop:'3px'}}>Correct answers</div>
          </div>
          <div style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'14px'}}>
            <div style={{fontFamily:'var(--serif)',fontSize:'36px',fontWeight:'800',color:'var(--gold)'}}>{avgTime}s</div>
            <div style={{fontSize:'11px',color:'var(--muted)',marginTop:'3px'}}>Avg time per puzzle</div>
          </div>
        </div>
        <div style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'14px',marginBottom:'1.25rem'}}>
          {puzzleScores.map((ps,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<2?'0.5px solid var(--surface3)':'none'}}>
              <span style={{fontSize:'12px',color:'var(--muted)'}}>Puzzle {i+1}</span>
              <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                <span style={{fontSize:'11px',color:'var(--muted)'}}>{ps.time}s</span>
                <span style={{fontSize:'12px',fontWeight:'500',color:ps.correct?'#1D9E75':'#E24B4A'}}>{ps.correct?'Correct':'Incorrect'}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:'var(--gold-dim)',border:'0.5px solid var(--gold-border)',borderRadius:'var(--r)',padding:'14px',marginBottom:'1.5rem'}}>
          <div style={{fontSize:'13px',color:'var(--text)',lineHeight:'1.65'}}>
            {correct===3?"Sharp. All 3 correct — and Cerebro also clocked your speed. Now let's see what the 99 percentile actually looks like.":correct>=2?"Two out of three — solid instincts. The third one reveals something useful. Let's show you what the 99 percentile actually requires.":"Raw speed matters more than a perfect score here. Let's show you why CAT is more accessible than you think."}
          </div>
        </div>
        <Btn label="Show me the 99 benchmark →" onClick={()=>setStep(7)}/>
      </div>
    );
  }

  // STEP 7: CAT BENCHMARKS + COLLEGES + PERSONA
  if(step===7){
    const persona=getPersona(puzzleScores,mindset,tier||0);
    return(
      <div style={{...S,paddingBottom:'2rem'}}>
        <Brand/><Progress pct={92}/>
        <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--gold)',fontWeight:'500',marginBottom:'0.5rem'}}>Step 7 of 7</div>
        <div style={{fontFamily:'var(--serif)',fontSize:'32px',fontWeight:'800',lineHeight:'1.05',color:'var(--text)',marginBottom:'0.75rem'}}>Here's what 99<br/>actually is.</div>
        <div style={{fontSize:'13px',color:'var(--muted)',marginBottom:'1.25rem',lineHeight:'1.6'}}>Not a myth. Not luck. Here's the math.</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'1.25rem'}}>
          {[{n:'~160',l:'Raw score for 99th percentile (out of 228)'},{n:'70%',l:'Accuracy needed — not perfection'},{n:'~40',l:'Questions attempted at 99 percentile'},{n:'2.3L',l:'Appear. Top 2,300 hit 99+'}].map((s,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'14px'}}>
              <div style={{fontFamily:'var(--serif)',fontSize:'28px',fontWeight:'800',color:'var(--gold)'}}>{s.n}</div>
              <div style={{fontSize:'11px',color:'var(--muted)',marginTop:'3px',lineHeight:'1.4'}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{background:'var(--gold-dim)',border:'0.5px solid var(--gold-border)',borderRadius:'var(--r)',padding:'14px',marginBottom:'1.25rem'}}>
          <div style={{fontSize:'12px',color:'var(--gold)',fontWeight:'500',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.08em'}}>The truth</div>
          <div style={{fontSize:'13px',color:'var(--muted)',lineHeight:'1.65'}}>Most 99 percentilers don't attempt everything. They <strong style={{color:'var(--text)'}}>pick the right ones, stay calm, move fast.</strong> That's exactly what Cerebro trains.</div>
        </div>
        <div style={{fontSize:'12px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'10px'}}>Colleges your score can unlock</div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'1.5rem'}}>
          {COLLEGES.map((c,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r-sm)',padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:'13px',color:'var(--text)',fontWeight:'500'}}>{c.name}</span>
              <span style={{fontSize:'11px',color:'var(--gold)'}}>{c.pct} percentile</span>
            </div>
          ))}
        </div>
        <div style={{background:'var(--gold-dim)',border:'1px solid var(--gold-border)',borderRadius:'var(--r)',padding:'20px',marginBottom:'1.5rem',textAlign:'center'}}>
          <div style={{fontSize:'11px',color:'var(--gold)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'8px'}}>Your Cerebro profile</div>
          <div style={{fontFamily:'var(--serif)',fontSize:'24px',fontWeight:'800',color:'var(--gold)',marginBottom:'6px'}}>{persona.persona}</div>
          <div style={{fontSize:'13px',color:'var(--muted)',lineHeight:'1.6'}}>{persona.coachNote}</div>
        </div>
        <Btn label={`Enter Cerebro, ${name.trim()} →`} onClick={finish}/>
      </div>
    );
  }

  return null;
}