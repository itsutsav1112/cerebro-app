import React from 'react';

export default function Profile({user}) {
  const attempts=user?.attempts||[];
  const total=attempts.length;
  const correct=attempts.filter(a=>a.correct).length;
  const accuracy=total>0?Math.round((correct/total)*100):0;
  const bySection={VARC:{total:0,correct:0},DILR:{total:0,correct:0},QA:{total:0,correct:0}};
  attempts.forEach(a=>{if(bySection[a.section]){bySection[a.section].total++;if(a.correct)bySection[a.section].correct++;}});
  const avgTime=attempts.length?Math.round(attempts.reduce((a,b)=>a+(b.time||0),0)/attempts.length):0;
  const days=user?.daysToCAT||0;
  const persona=user?.persona;
  const S={padding:'1.5rem 1.25rem',minHeight:'100vh',background:'var(--bg)'};

  return(
    <div style={S}>
      <div style={{fontFamily:'var(--serif)',fontSize:'13px',fontWeight:'700',letterSpacing:'0.18em',color:'var(--gold)',textTransform:'uppercase',marginBottom:'1.5rem'}}>My Profile</div>
      <div style={{background:'var(--gold-dim)',border:'0.5px solid var(--gold-border)',borderRadius:'var(--r)',padding:'16px',marginBottom:'1.25rem'}}>
        <div style={{fontSize:'11px',color:'var(--gold)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>You are</div>
        <div style={{fontFamily:'var(--serif)',fontSize:'20px',fontWeight:'800',color:'var(--gold)',marginBottom:'4px'}}>{persona?.persona||'—'}</div>
        <div style={{fontSize:'12px',color:'var(--muted)',lineHeight:'1.5'}}>{days} days to CAT 2026</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'1.25rem'}}>
        {[{n:total,l:'Questions answered'},{n:accuracy+'%',l:'Overall accuracy'},{n:avgTime+'s',l:'Avg time per question'},{n:user?.sessionCount||0,l:'Sessions completed'}].map((item,i)=>(
          <div key={i} style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'14px'}}>
            <div style={{fontFamily:'var(--serif)',fontSize:'26px',fontWeight:'800',color:'var(--gold)'}}>{item.n}</div>
            <div style={{fontSize:'11px',color:'var(--muted)',marginTop:'3px',lineHeight:'1.4'}}>{item.l}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:'10px'}}>Section breakdown</div>
      <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'1.25rem'}}>
        {Object.entries(bySection).map(([sec,data])=>{
          const acc=data.total>0?Math.round((data.correct/data.total)*100):0;
          const color=sec==='VARC'?'#7F77DD':sec==='DILR'?'#1D9E75':'#C9963A';
          return(
            <div key={sec} style={{background:'var(--surface)',border:'0.5px solid var(--surface3)',borderRadius:'var(--r)',padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                <span style={{fontSize:'13px',fontWeight:'500',color:'var(--text)'}}>{sec}</span>
                <span style={{fontSize:'12px',color}}>{data.total>0?acc+'%':'Not started'}</span>
              </div>
              <div style={{height:'4px',background:'var(--surface3)',borderRadius:'100px',overflow:'hidden'}}>
                <div style={{width:acc+'%',height:'100%',background:color,borderRadius:'100px',transition:'width 0.6s'}}></div>
              </div>
              <div style={{fontSize:'10px',color:'var(--muted)',marginTop:'4px'}}>{data.correct}/{data.total} correct</div>
            </div>
          );
        })}
      </div>
      {total===0&&<div style={{fontSize:'13px',color:'var(--muted)',textAlign:'center',padding:'2rem 1rem',lineHeight:'1.6'}}>No questions answered yet. Head to Learn to get started.</div>}
    </div>
  );
}