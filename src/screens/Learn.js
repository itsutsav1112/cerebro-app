import React, { useState, useEffect, useRef } from 'react';
import { generateQuestion } from '../groq';

const SECTION_INFO = {
  VARC:{color:'#7F77DD',desc:'RC · Para Jumbles · Summary · Odd Sentence'},
  DILR:{color:'#1D9E75',desc:'Sets · Arrangements · Data Interpretation'},
  QA:{color:'#C9963A',desc:'Arithmetic · Algebra · Geometry · Numbers'}
};

const FALLBACK_QUESTIONS = {
  VARC: [
    {type:'Para Jumble',question:'Arrange these sentences into a coherent paragraph:',sentences:[{l:'A',t:'But the moment we attach a price to it, the relationship changes fundamentally.'},{l:'B',t:'A neighbour who helps you move furniture is doing you a favour; pay him and he becomes a hired hand.'},{l:'C',t:'Markets are not merely neutral mechanisms — they express and promote certain values.'},{l:'D',t:'Putting a price on something previously outside the market can crowd out non-market norms.'}],options:[{l:'A',t:'CDAB'},{l:'B',t:'DCAB'},{l:'C',t:'CADB'},{l:'D',t:'DCBA'}],correct:'A',feedback_correct:'Correct. C opens (thesis), D elaborates, A pivots with "but", B gives the example. Opener rule: broadest claim first.',feedback_wrong:'C opens — it makes the broadest claim. D elaborates, A pivots, B is the concrete example that closes. CDAB.',shortcut:'Opener = broadest claim. Example = always last. "But/however" = never last.'},
    {type:'Para Summary',question:'The reasonable man adapts himself to the world. The unreasonable man persists in trying to adapt the world to himself. Therefore, all progress depends on the unreasonable man.',sentences:[],options:[{l:'A',t:'Reasonable people survive better in society.'},{l:'B',t:'Progress is driven by those who refuse to accept the world as it is.'},{l:'C',t:'Unreasonable behaviour is generally more beneficial.'},{l:'D',t:'The world would be better if more people were unreasonable.'}],correct:'B',feedback_correct:'Correct. B matches the author\'s exact claim — no more, no less. C and D inflate it; A misses the point entirely.',feedback_wrong:'B is correct. C overgeneralises. D adds a prescription Shaw never makes. Right answer = author\'s claim at exact scope.',shortcut:'Wrong RC options either shrink the claim, inflate it, or add a judgement the author never made.'},
    {type:'Odd Sentence Out',question:'Four of these five sentences form a coherent paragraph. Find the odd one out.\n1. The Bayeux tapestry was an obvious way to tell people about the rise of the Normans.\n2. Art historian Linda Neagley argued that pre-Renaissance people interacted with art physically.\n3. So if the tapestry was hung in a square, people would have stood in the centre.\n4. That would make it an 11th-century immersive space drawing the viewer\'s attention.\n5. The Bayeux tapestry would have been hung at eye level to enable this.',sentences:[],options:[{l:'A',t:'Sentence 1'},{l:'B',t:'Sentence 2'},{l:'C',t:'Sentence 3'},{l:'D',t:'Sentence 5'}],correct:'A',feedback_correct:'Correct. Sentence 1 introduces a different idea (political narrative) while 2,3,4,5 discuss physical/immersive experience of the tapestry.',feedback_wrong:'Sentence 1 is the odd one out — it talks about political narrative while all others discuss physical/immersive interaction with art.',shortcut:'Odd sentence = introduces a different topic or logic chain than the other four.'}
  ],
  QA: [
    {type:'Percentages',question:'A\'s salary is 25% more than B\'s. By what percentage is B\'s salary less than A\'s?',sentences:[],options:[{l:'A',t:'25%'},{l:'B',t:'20%'},{l:'C',t:'21%'},{l:'D',t:'22%'}],correct:'B',feedback_correct:"Correct. Let B=100, A=125. B is 25 less than A. As % of A: 25/125 × 100 = 20%. Classic base-change trap.",feedback_wrong:"Let B=100, A=125. B is 25 less than A. But the % is of A (the larger), so: 25/125 × 100 = 20%, not 25%.",shortcut:'If A is x% more than B, B is x/(100+x)% less than A. Here: 25/125 = 20%.'},
    {type:'Arithmetic',question:'A merchant marks goods 40% above cost and offers 20% discount. Selling price is ₹1,120. What is profit %?',sentences:[],options:[{l:'A',t:'10%'},{l:'B',t:'12%'},{l:'C',t:'11.2%'},{l:'D',t:'8%'}],correct:'B',feedback_correct:'Correct. CP × 1.4 × 0.8 = 1.12 × CP = 1120. So CP = 1000, profit = ₹120 = 12%.',feedback_wrong:'CP × 1.4 × 0.8 = 1.12 × CP. So profit = 12%, not 11.2%. The multiplier ≠ profit %.',shortcut:'Net successive %: a−b−(ab/100) = 40−20−8 = 12%.'},
    {type:'Algebra',question:'If x + 1/x = 3, what is x² + 1/x²?',sentences:[],options:[{l:'A',t:'7'},{l:'B',t:'9'},{l:'C',t:'11'},{l:'D',t:'6'}],correct:'A',feedback_correct:'Correct. Square both sides: x²+2+1/x² = 9. So x²+1/x² = 7.',feedback_wrong:'Square x+1/x=3: get x²+2+1/x²=9. Subtract 2: answer is 7.',shortcut:'Identity: if x+1/x = k, then x²+1/x² = k²−2. Appears almost every CAT.'},
    {type:'Number System',question:'What is the remainder when 7¹⁰⁰ is divided by 48?',sentences:[],options:[{l:'A',t:'1'},{l:'B',t:'7'},{l:'C',t:'47'},{l:'D',t:'25'}],correct:'A',feedback_correct:'Correct. 7²=49=48+1 ≡ 1 (mod 48). So 7¹⁰⁰ = (7²)⁵⁰ ≡ 1⁵⁰ = 1.',feedback_wrong:'7²=49≡1 (mod 48). So any even power of 7 gives remainder 1. 100 is even → remainder = 1.',shortcut:'Find the cycle first. 7²≡1 mod 48. Cycle length=2. Even power → remainder 1.'},
    {type:'Time Speed Distance',question:'A train 360m long crosses a pole in 18 seconds. How long to cross a 240m platform?',sentences:[],options:[{l:'A',t:'24 sec'},{l:'B',t:'28 sec'},{l:'C',t:'30 sec'},{l:'D',t:'32 sec'}],correct:'C',feedback_correct:'Correct. Speed=360/18=20m/s. Total distance=360+240=600m. Time=600/20=30s.',feedback_wrong:'Speed=20m/s. Crossing platform = train+platform = 600m. Time=600/20=30s.',shortcut:'Pole = train length only. Platform = train + platform. Speed = length/time.'}
  ],
  DILR: [
    {type:'Arrangement',question:'Six people A,B,C,D,E,F sit in a row. A is left of B. C is right of D. E is not at either end. F is at one end. B and D are not adjacent. How many people sit between A and F if F is at the right end?',sentences:[],options:[{l:'A',t:'2'},{l:'B',t:'3'},{l:'C',t:'4'},{l:'D',t:'Cannot be determined'}],correct:'D',feedback_correct:'Correct. Multiple valid arrangements satisfy all constraints, giving different answers. Cannot be determined.',feedback_wrong:'Try building two valid arrangements — you\'ll get different counts between A and F. That means: Cannot be determined.',shortcut:'Always verify uniqueness before answering. If two valid arrangements give different answers = Cannot be determined.'},
    {type:'Data Set',question:'In a class of 30, 18 play cricket, 15 play football, 5 play both. How many play neither?',sentences:[],options:[{l:'A',t:'2'},{l:'B',t:'3'},{l:'C',t:'4'},{l:'D',t:'5'}],correct:'A',feedback_correct:'Correct. Cricket only=13, Football only=10, Both=5. Total playing=28. Neither=30−28=2.',feedback_wrong:'Use: Total = Cricket + Football − Both + Neither. 30 = 18+15−5+Neither. Neither = 2.',shortcut:'Venn: Total = A + B − Both + Neither. Always draw the sets first.'}
  ]
};

export default function Learn({user}) {
  const [phase,setPhase]=useState('intro');
  const [wantsExamInfo,setWantsExamInfo]=useState(null);
  const [section,setSection]=useState(null);
  const [question,setQuestion]=useState(null);
  const [loading,setLoading]=useState(false);
  const [answered,setAnswered]=useState(false);
  const [selected,setSelected]=useState(null);
  const [feedback,setFeedback]=useState(null);
  const [timer,setTimer]=useState(0);
  const [showTimer,setShowTimer]=useState(false);
  const [qCount,setQCount]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [usedFallbackIdx,setUsedFallbackIdx]=useState({VARC:0,DILR:0,QA:0});
  const timerRef=useRef(null);
  const startRef=useRef(null);
  const stage=user?.persona?.startStage||1;
  const name=user?.name||'';

  useEffect(()=>{
    if(phase==='question'&&question){
      setTimer(0);
      startRef.current=Date.now();
      timerRef.current=setInterval(()=>{
        const elapsed=Math.floor((Date.now()-startRef.current)/1000);
        setTimer(elapsed);
        if(qCount>=2)setShowTimer(true);
      },1000);
    }
    return()=>clearInterval(timerRef.current);
  },[phase,question]);

  const loadQuestion=async(sec)=>{
    setLoading(true);setAnswered(false);setSelected(null);setFeedback(null);
    setSection(sec);setPhase('question');
    try{
      const raw=await generateQuestion(sec,stage);
      const clean=raw.replace(/```json|```/g,'').trim();
      const firstBrace=clean.indexOf('{');
      const lastBrace=clean.lastIndexOf('}');
      if(firstBrace===-1)throw new Error('no json');
      const q=JSON.parse(clean.substring(firstBrace,lastBrace+1));
      if(!q.question||!q.options||!q.correct)throw new Error('invalid');
      setQuestion(q);
    }catch(e){
      const fallbacks=FALLBACK_QUESTIONS[sec];
      const idx=usedFallbackIdx[sec]%fallbacks.length;
      setQuestion(fallbacks[idx]);
      setUsedFallbackIdx(prev=>({...prev,[sec]:(prev[sec]+1)%fallbacks.length}));
    }
    setLoading(false);
  };

  const answer=(label)=>{
    if(answered)return;
    clearInterval(timerRef.current);
    setAnswered(true);setSelected(label);
    const isCorrect=label===question.correct;
    if(isCorrect)setCorrect(c=>c+1);
    setQCount(q=>q+1);
    const elapsed=Math.floor((Date.now()-startRef.current)/1000);
    const attempts=[...(user.attempts||[]),{section,correct:isCorrect,time:elapsed,stage}];
    user.attempts=attempts;
    localStorage.setItem('cerebro_user',JSON.stringify(user));
    setFeedback({correct:isCorrect,text:isCorrect?question.feedback_correct:question.feedback_wrong,shortcut:question.shortcut,time:elapsed});
  };

  const S={padding:'1.5rem 1.25rem',minHeight:'100vh',background:'var(--bg)'};

  if(phase==='intro')return(
    <div style={S}>
      <div style={{fontFamily:'var(--serif)',fontSize:'13px',fontWeight:'700',letterSpacing:'0.18em',color:'var(--gold)',textTransform:'uppercase',marginBottom:'1.5rem'}}>Cerebro</div>
      <div style={{fontFamily:'var(--serif)',fontSize:'26px',fontWeight:'800',color:'var(--text)',marginBottom:'0.5rem',lineHeight:'1.2'}}>
        Welcome{name?`, ${name}`:''}. 
      </div>
      <div style={{fontSize:'13px',color:'var(--muted)',lineHeight:'1.7',marginBottom:'1.5rem',padding:'14px',background:'var(--surface)',borderRadius:'var(--r)',border:'0.5px solid var(--surface3)'}}>{user?.persona?.coachNote||'Your path is ready.'}</div>
      <div style={{fontSize:'14px',color:'var(--text)',lineHeight:'1.65',marginBottom:'1.5rem'}}>Before we dive in — would you like a quick breakdown of the exam? Format, strategy, what 99 actually requires?</div>
      <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'1.5rem'}}>
        {[{v:true,l:'Yes — walk me through the exam first'},{v:false,l:"Skip — let's get into questions"}].map((o,i)=>(
          <div key={i} onClick={()=>setWantsExamInfo(o.v)} style={{background:wantsExamInfo===o.v?'var(--gold-dim)':'var(--surface)',border:`${wantsExamInfo===o.v?'1px':'0.5px'} solid ${wantsExamInfo===o.v?'var(--gold)':'var(--hint)'}`,borderRadius:'var(--r)',padding:'14px 16px',cursor:'pointer',fontSize:'14px',color:'var(--text)'}}>{o.l}</div>
        ))}
      </div>
      {wantsExamInfo!==null&&(
        <button onClick={()=>setPhase(wantsExamInfo?'examinfo':'sectionpick')} style={{background:'var(--gold)',color:'#0A0A0F',border:'none',borderRadius:'var(--r)',padding:'15px',fontFamily:'var(--serif)',fontSize:'15px',fontWeight:'700',cursor:'pointer',width:'100%'}}>
          {wantsExamInfo?'Show me the exam →':'Pick a section →'}
        </button>
      )}
    </div>
  );

  if(phase==='examinfo')return(
    <div style={{...S,paddingBottom:'2rem'}}>
      <div style={{fontFamily:'var(--serif)',fontSize:'13px',fontWeight:'700',letterSpacing:'0.18em',color:'var(--gold)',textTransform:'uppercase',marginBottom:'1.5rem'}}>Cerebro</div>
      <div style={{fontFamily:'var(--serif)',fontSize:'24px',fontWeight:'800',color:'var(--text)',marginBottom:'1.25rem'}}>The exam, decoded.</div>
      {[
        {title:'The format',content:'3 sections. 40 mins each. VARC (24 questions), DILR (20 questions), QA (22 questions). Total: 66 questions, 120 minutes. +3 for correct, −1 for wrong MCQ. TITA questions have no negative marking.'},
        {title:'The game no one tells you',content:"You don't need to attempt everything. At 99 percentile, most people attempt ~40 questions. That's 60% of the paper. The game is identifying your 40 — not solving all 66."},
        {title:'VARC — it\'s an elimination game',content:"Every RC and VA question has one option that's almost right. Your job: spot why it's wrong. Read for tone and scope, not detail. If an option adds something the author didn't say — eliminate it immediately."},
        {title:'DILR — identify first, solve later',content:"The first 5-6 minutes are sacred. Don't solve — scan all sets. Identify the 2 easiest, attack those first. Getting 3 sets fully correct = 95-98 percentile in this section. The set you skip could be the hardest one."},
        {title:'QA — 10th grade math, but fast',content:"Most questions are arithmetic, algebra, and geometry. If it looks complicated, there's a shortcut. Cerebro teaches you those shortcuts question by question. You only need ~12-14 right out of 22."},
        {title:'What 99 actually looks like',content:"Score ~160 out of 228. Accuracy ~70%. The difference between 90 and 99 percentile is almost never knowledge — it's composure and question selection."},
      ].map((item,i)=>(
        <div key={i} style={{marginBottom:'14px',background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'14px 16px'}}>
          <div style={{fontSize:'11px',color:'var(--gold)',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:'500',marginBottom:'6px'}}>{item.title}</div>
          <div style={{fontSize:'13px',color:'var(--muted)',lineHeight:'1.7'}}>{item.content}</div>
        </div>
      ))}
      <div style={{background:'var(--gold-dim)',border:'0.5px solid var(--gold-border)',borderRadius:'var(--r)',padding:'14px',marginBottom:'1.5rem'}}>
        <div style={{fontSize:'13px',color:'var(--text)',lineHeight:'1.65'}}>That's the map. Now let's figure out exactly where you are — and build the fastest path to 99.</div>
      </div>
      <button onClick={()=>setPhase('sectionpick')} style={{background:'var(--gold)',color:'#0A0A0F',border:'none',borderRadius:'var(--r)',padding:'15px',fontFamily:'var(--serif)',fontSize:'15px',fontWeight:'700',cursor:'pointer',width:'100%'}}>Let's start →</button>
    </div>
  );

  if(phase==='sectionpick')return(
    <div style={S}>
      <div style={{fontFamily:'var(--serif)',fontSize:'13px',fontWeight:'700',letterSpacing:'0.18em',color:'var(--gold)',textTransform:'uppercase',marginBottom:'1.5rem'}}>Learn</div>
      <div style={{fontFamily:'var(--serif)',fontSize:'24px',fontWeight:'800',color:'var(--text)',marginBottom:'0.5rem'}}>What are we<br/>working on?</div>
      <div style={{fontSize:'13px',color:'var(--muted)',marginBottom:'1.5rem'}}>Pick a section or go mixed.</div>
      <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'1.5rem'}}>
        {Object.entries(SECTION_INFO).map(([sec,info])=>(
          <div key={sec} onClick={()=>loadQuestion(sec)} style={{background:'var(--surface)',border:'0.5px solid var(--hint)',borderRadius:'var(--r)',padding:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:'16px',fontWeight:'500',color:'var(--text)',fontFamily:'var(--serif)',marginBottom:'3px'}}>{sec}</div>
              <div style={{fontSize:'11px',color:'var(--muted)'}}>{info.desc}</div>
            </div>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:info.color,flexShrink:0}}></div>
          </div>
        ))}
        <div onClick={()=>loadQuestion(['VARC','DILR','QA'][Math.floor(Math.random()*3)])} style={{background:'var(--surface)',border:'0.5px solid var(--hint)',borderRadius:'var(--r)',padding:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'16px',fontWeight:'500',color:'var(--text)',fontFamily:'var(--serif)',marginBottom:'3px'}}>Mixed</div>
            <div style={{fontSize:'11px',color:'var(--muted)'}}>Random section — exam simulation</div>
          </div>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--gold)',flexShrink:0}}></div>
        </div>
      </div>
      {qCount>0&&<div style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'12px 14px',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:'12px',color:'var(--muted)'}}>This session</span><span style={{fontSize:'12px',color:'var(--gold)'}}>{correct}/{qCount} correct</span></div>}
    </div>
  );

  if(phase==='question')return(
    <div style={S}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
        <button onClick={()=>setPhase('sectionpick')} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'18px',padding:'4px'}}>←</button>
        <div style={{fontSize:'10px',color:SECTION_INFO[section]?.color||'var(--gold)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:'500'}}>{section}</div>
        {showTimer?<div style={{fontSize:'11px',color:timer>120?'#E24B4A':timer>90?'var(--gold)':'var(--muted)'}}>{timer}s</div>:<div style={{width:'30px'}}></div>}
      </div>
      {loading?(
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px',flexDirection:'column',gap:'12px'}}>
          <div style={{width:'20px',height:'20px',border:'2px solid var(--surface3)',borderTop:'2px solid var(--gold)',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
          <div style={{fontSize:'12px',color:'var(--muted)'}}>Generating question...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ):question&&(
        <>
          <div style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'16px',marginBottom:'14px'}}>
            <div style={{fontSize:'10px',color:'var(--gold)',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:'500',marginBottom:'8px'}}>{question.type}</div>
            <div style={{fontSize:'14px',lineHeight:'1.7',color:'var(--text)',marginBottom:question.sentences?.length?'12px':'0'}}>{question.question}</div>
            {question.sentences?.map((s,i)=>(
              <div key={i} style={{fontSize:'13px',lineHeight:'1.55',padding:'7px 11px',background:'var(--surface2)',borderRadius:'6px',border:'0.5px solid var(--hint)',color:'var(--text)',marginBottom:'6px'}}>
                <strong style={{color:'var(--gold)',marginRight:'6px'}}>{s.l}.</strong>{s.t}
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'14px'}}>
            {question.options?.map((o)=>(
              <div key={o.l} onClick={()=>answer(o.l)} style={{background:answered&&o.l===question.correct?'rgba(29,158,117,0.12)':answered&&o.l===selected&&o.l!==question.correct?'rgba(226,75,74,0.12)':selected===o.l?'var(--gold-dim)':'var(--surface)',border:`0.5px solid ${answered&&o.l===question.correct?'#1D9E75':answered&&o.l===selected&&o.l!==question.correct?'#E24B4A':selected===o.l?'var(--gold)':'var(--hint)'}`,borderRadius:'var(--r-sm)',padding:'12px 14px',cursor:answered?'default':'pointer',display:'flex',alignItems:'center',gap:'10px',fontSize:'13.5px',color:'var(--text)',transition:'all 0.15s'}}>
                <span style={{width:'22px',height:'22px',borderRadius:'50%',background:answered&&o.l===question.correct?'#1D9E75':answered&&o.l===selected&&o.l!==question.correct?'#E24B4A':'var(--surface2)',border:`0.5px solid ${answered&&o.l===question.correct?'#1D9E75':'var(--hint)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'600',flexShrink:0,color:answered&&(o.l===question.correct||(o.l===selected&&o.l!==question.correct))?'white':'var(--muted)'}}>{o.l}</span>
                {o.t}
              </div>
            ))}
          </div>
          {feedback&&(
            <>
              <div style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'13px 15px',marginBottom:'10px'}}>
                <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:'500',color:feedback.correct?'#1D9E75':'#E24B4A',marginBottom:'7px'}}>{feedback.correct?'Correct':'Incorrect'}</div>
                <div style={{fontSize:'13px',lineHeight:'1.65',color:'var(--muted)',marginBottom:question.shortcut?'10px':'0'}}>{feedback.text}</div>
                {question.shortcut&&<div style={{fontSize:'12px',color:'var(--gold)',borderTop:'0.5px solid var(--surface3)',paddingTop:'8px',marginTop:'4px',lineHeight:'1.5'}}>{question.shortcut}</div>}
              </div>
              {showTimer&&<div style={{fontSize:'12px',color:'var(--muted)',marginBottom:'10px',padding:'8px 12px',background:'var(--surface)',borderRadius:'var(--r-sm)',borderLeft:'3px solid var(--gold-border)'}}>{feedback.time>120?`You took ${feedback.time}s. Target: under 2 min.`:`Good pace — ${feedback.time}s.`}</div>}
              <button onClick={()=>loadQuestion(section)} style={{background:'var(--gold)',color:'#0A0A0F',border:'none',borderRadius:'var(--r)',padding:'13px',fontFamily:'var(--serif)',fontSize:'14px',fontWeight:'700',cursor:'pointer',width:'100%'}}>Next question →</button>
            </>
          )}
        </>
      )}
    </div>
  );

  return null;
}