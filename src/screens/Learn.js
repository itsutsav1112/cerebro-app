import React, { useState, useEffect, useRef } from 'react';
import { generateQuestion } from '../groq';

const SECTION_INFO = {
  VARC:{color:'#7F77DD',desc:'RC · Para Jumbles · Summary · Odd Sentence'},
  DILR:{color:'#1D9E75',desc:'Sets · Arrangements · Data Interpretation'},
  QA:{color:'#C9963A',desc:'Arithmetic · Algebra · Geometry · Numbers'}
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
  const timerRef=useRef(null);
  const startRef=useRef(null);
  const stage=user?.persona?.startStage||1;

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
      const q=JSON.parse(clean);
      setQuestion(q);
    }catch(e){
      setQuestion({type:'Arithmetic',question:"A merchant marks goods 40% above cost and offers 20% discount. Selling price is ₹1,120. What is profit %?",sentences:[],options:[{l:'A',t:'10%'},{l:'B',t:'12%'},{l:'C',t:'11.2%'},{l:'D',t:'8%'}],correct:'B',feedback_correct:"Correct. CP×1.4×0.8=1.12×CP=1120. Profit=12%.",feedback_wrong:"CP×1.4×0.8=1.12. Profit=12%, not the multiplier.",shortcut:"Net %: a−b−(ab/100)=40−20−8=12%"});
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
      <div style={{fontFamily:'var(--serif)',fontSize:'26px',fontWeight:'800',color:'var(--text)',marginBottom:'0.5rem',lineHeight:'1.2'}}>Welcome, {user?.persona?.persona||'Warrior'}.</div>
      <div style={{fontSize:'13px',color:'var(--muted)',lineHeight:'1.7',marginBottom:'1.5rem',padding:'14px',background:'var(--surface)',borderRadius:'var(--r)',border:'0.5px solid var(--surface3)'}}>{user?.persona?.coachNote||'Your path is ready.'}</div>
      <div style={{fontSize:'14px',color:'var(--text)',lineHeight:'1.65',marginBottom:'1.5rem'}}>Before we dive in — would you like a quick breakdown of the exam? Format, strategy, what 99 actually requires?</div>
      <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'1.5rem'}}>
        {[{v:true,l:'Yes — walk me through the exam first'},{v:false,l:'Skip — let\'s get into questions'}].map((o,i)=>(
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
        {title:'The format',content:'3 sections. 40 mins each. VARC (24 questions), DILR (20 questions), QA (22 questions). Total: 66 questions, 120 minutes. +3 for correct, -1 for wrong MCQ. TITA questions have no negative marking.'},
        {title:'The game no one tells you',content:"You don't need to attempt everything. At 99 percentile, most people attempt ~40 questions. That's 60% of the paper. The game is identifying your 40 — not solving all 66."},
        {title:'VARC strategy',content:"Pure elimination. Every RC and VA question has one option that's almost right — your job is to spot why it's wrong. Read for tone and scope, not detail. If an option adds something the author didn't say — eliminate it."},
        {title:'DILR strategy',content:"The first 5-6 minutes are sacred. Don't solve — scan. Go through all sets, identify the 2 easiest, attack those first. Getting 3 sets fully correct puts you at 95-98 percentile in this section alone."},
        {title:'QA strategy',content:"10th grade math, but fast. Most questions are from arithmetic, algebra, and geometry. If a question looks complicated, there's usually a shortcut. Cerebro teaches you those shortcuts, question by question."},
        {title:'What 99 actually looks like',content:"Score ~160 out of 228. Accuracy around 70%. Pick the right questions. Stay calm. The difference between 90 and 99 percentile is almost never knowledge — it's composure and selection."},
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