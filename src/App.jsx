import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Sparkles, Cpu, ShieldCheck, Zap, BrainCircuit,
  GraduationCap, Palette, BriefcaseBusiness, Gamepad2, Trophy, RotateCcw,
  Check, ChevronRight, Menu, X, ScanLine, Wifi, WifiOff, Download, Copy,
  Monitor, LockKeyhole, BatteryCharging, Gauge, BarChart3, Users, ShoppingBag,
  WandSparkles, FileText, Image, Mic, CircleHelp, Play, ExternalLink
} from "lucide-react";
import { api } from "./api";

const personas = [
  { id:"student", name:"The Student", sub:"Learn smarter. Build faster.", icon:GraduationCap, color:"blue", needs:["Study notes","Research","Coding"], challenge:"Turn a long set of class notes into a clean revision plan." },
  { id:"creator", name:"The Creator", sub:"Make your ideas impossible to ignore.", icon:Palette, color:"purple", needs:["Design","Video editing","Content"], challenge:"Turn one idea into a social caption and a creative brief." },
  { id:"hustler", name:"The Hustler", sub:"Do more without the chaos.", icon:BriefcaseBusiness, color:"green", needs:["Multitasking","Meetings","Productivity"], challenge:"Convert meeting notes into clear owners and next steps." },
  { id:"gamer", name:"The Gamer", sub:"Play hard. Create harder.", icon:Gamepad2, color:"orange", needs:["Gaming","Streaming","Graphics"], challenge:"Choose a setup based on your games, display and GPU needs." }
];

const quiz = [
  { title:"The 30-second reset", category:"PRODUCTIVITY", question:"You have 4 pages of messy project notes and a deadline. What's the smartest move?", options:["Retype everything manually","Use an AI assistant to summarize, organize and create action points","Open 20 browser tabs","Ignore the notes"], answer:1, explanation:"AI tools can help summarize long information and turn it into useful next steps. Some compatible workloads can run locally on an AI PC." },
  { title:"Creator emergency", category:"CREATIVITY", question:"Your video is ready, but the audio is noisy and the background is distracting. What do you explore?", options:["Start the entire video again","Use compatible AI-assisted editing, noise reduction or background effects","Lower screen brightness","Buy a new camera immediately"], answer:1, explanation:"Supported AI apps can help with creative and collaboration tasks. Always check the app and laptop requirements." },
  { title:"Your data, your call", category:"PRIVACY", question:"You want to use an AI feature with personal files. What should you check first?", options:["Assume every AI app works offline","Check whether it runs on-device, what data goes to the cloud and its privacy settings","Share your password","Turn off security settings"], answer:1, explanation:"On-device processing can reduce the need to send some data to cloud services, but actual behavior depends on the app and its settings." }
];

const fallbackRecommendations = {
  student: { title:"The Study & Build setup", why:"Prioritize a capable Intel Core Ultra configuration, sufficient RAM and fast SSD storage for IDEs, research, many browser tabs and supported AI tools.", checks:["16 GB RAM or more where budget allows","512 GB SSD or more","Comfortable keyboard and display"] },
  creator: { title:"The Creator setup", why:"Prioritize the full graphics configuration, memory, display quality and the creative applications you actually use.", checks:["Check GPU and graphics memory","16–32 GB RAM depending on editing","Color-accurate display and fast SSD"] },
  hustler: { title:"The Productivity setup", why:"Balance CPU responsiveness, efficient supported AI workloads, video-call features, battery capacity and portability.", checks:["16 GB RAM or more","Battery capacity and real reviews","Webcam, microphone and display"] },
  gamer: { title:"The Gaming & Stream setup", why:"Choose based on the exact GPU, cooling, display refresh rate and target games—not the processor name alone.", checks:["Compare dedicated/integrated GPU","Cooling and sustained performance","Display refresh rate and RAM"] }
};

function IconBox({ icon:Icon, tone="cyan" }) { return <div className={`icon-box ${tone}`}><Icon size={20}/></div>; }
function SectionTitle({ eyebrow, title, text }) { return <div className="section-title"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{text && <p>{text}</p>}</div>; }

export default function App() {
  const [page,setPage] = useState("home");
  const [persona,setPersona] = useState(null);
  const [challenge,setChallenge] = useState(0);
  const [answers,setAnswers] = useState([]);
  const [score,setScore] = useState(0);
  const [aiInput,setAiInput] = useState("Artificial Intelligence is changing how students learn. It can summarize information, explain difficult concepts and help organize projects. Students should still verify facts and understand the material themselves.");
  const [aiMode,setAiMode] = useState("study");
  const [aiOutput,setAiOutput] = useState("");
  const [aiLoading,setAiLoading] = useState(false);
  const [budget,setBudget] = useState("70000");
  const [recommendationOverride,setRecommendationOverride] = useState(null);
  const [apiOnline,setApiOnline] = useState(false);
  const [dashboard,setDashboard] = useState(null);
  const [toast,setToast] = useState("");
  const [mobileMenu,setMobileMenu] = useState(false);
  const [sessionId] = useState(() => `IAQ-${Date.now().toString(36).toUpperCase()}`);

  useEffect(() => { api.health().then(x => setApiOnline(!!x?.ok)); }, []);
  useEffect(() => { if (toast) { const t=setTimeout(()=>setToast(""),2600); return ()=>clearTimeout(t); } },[toast]);

  const selectedPersona = personas.find(p=>p.id===persona) || personas[0];
  const recommendation = recommendationOverride || fallbackRecommendations[persona || "student"];

  const navigate = (p) => { setPage(p); setMobileMenu(false); if(p==="dashboard") api.analytics().then(setDashboard); window.scrollTo({top:0,behavior:"smooth"}); };
  const startQuest = () => { setChallenge(0); setAnswers([]); setScore(0); setRecommendationOverride(null); navigate("persona"); };
  const answerQuestion = (choice) => {
    const correct = choice===quiz[challenge].answer;
    const nextScore = score + (correct ? 100 : 0);
    setScore(nextScore);
    setAnswers([...answers,{choice,correct}]);
    setTimeout(() => {
      if(challenge < quiz.length-1) setChallenge(challenge+1);
      else finishQuest(nextScore);
    }, 1150);
  };
  const finishQuest = async (finalScore) => {
    const result = { session_id:sessionId, persona, score:finalScore, answers:answers.length+1, budget_inr:Number(budget) };
    await api.saveSession(result);
    navigate("result");
  };

  const runAI = async () => {
    if(!aiInput.trim()) return;
    setAiLoading(true); setAiOutput("");
    const result = await api.generate({ mode:aiMode, text:aiInput });
    if(result?.output) setAiOutput(result.output);
    else {
      const text = aiInput.trim();
      const sentences = text.split(/[.!?]\s+/).filter(Boolean);
      const fallback = aiMode==="study"
        ? `QUICK SUMMARY\n${sentences.slice(0,2).join(". ")}.\n\nKEY TAKEAWAYS\n${sentences.slice(0,3).map((s,i)=>`${i+1}. ${s.trim()}`).join("\n")}\n\nCHECK YOUR UNDERSTANDING\n1. What is the main idea?\n2. Which point needs an example?\n3. What should you verify independently?`
        : aiMode==="creator"
        ? `CREATIVE DIRECTION\nCore idea: ${sentences[0] || text}\n\nCAPTION\n“Big ideas start with one small spark. Make it clear, make it useful, make it yours.”\n\nCONTENT TIP\nUse a strong opening, one clear benefit and a call to action.`
        : `ACTION PLAN\n${sentences.slice(0,4).map((s,i)=>`${i+1}. ${s.trim()} — assign an owner and deadline`).join("\n")}\n\nNEXT STEP\nConfirm priorities, owners and due dates before sharing.`;
      setAiOutput(fallback);
    }
    setAiLoading(false);
  };

  const getRecommendation = async () => {
    const data = await api.recommend({ persona, budget_inr:Number(budget) });
    if(data?.recommendation) { setRecommendationOverride(data.recommendation); setToast("Your recommendation is ready."); }
    else setToast("Personalized recommendation generated.");
  };

  const copyResult = async () => {
    const text = `INTEL AI QUEST\nPersona: ${selectedPersona.name}\nScore: ${score}/300\nRecommendation: ${recommendation.title}\n${recommendation.why}`;
    try { await navigator.clipboard.writeText(text); setToast("Recommendation copied!"); }
    catch { setToast("Select and copy your result."); }
  };

  const downloadSummary = () => {
    const content = `INTEL AI QUEST — SHOPPER SUMMARY\nSession: ${sessionId}\nPersona: ${selectedPersona.name}\nScore: ${score}/300\nBudget: ₹${Number(budget).toLocaleString("en-IN")}\n\n${recommendation.title}\n${recommendation.why}\n\nConfiguration checklist:\n${recommendation.checks.map(x=>"- "+x).join("\n")}\n\nAsk the store expert to demonstrate a supported AI feature on the actual laptop.`;
    const blob = new Blob([content],{type:"text/plain"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="intel-ai-quest-result.txt"; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>navigate("home")}><span className="intel-mark">intel</span><span className="brand-divider"/>AI QUEST</button>
      <nav className={mobileMenu?"nav open":"nav"}>
        <button className={page==="home"?"nav-active":""} onClick={()=>navigate("home")}>Experience</button>
        <button className={page==="studio"?"nav-active":""} onClick={()=>navigate("studio")}>AI Studio</button>
        <button className={page==="compare"?"nav-active":""} onClick={()=>navigate("compare")}>Discover AI PC</button>
        <button className={page==="dashboard"?"nav-active":""} onClick={()=>navigate("dashboard")}>Retail Insights</button>
      </nav>
      <div className="top-actions"><span className={`status ${apiOnline?"online":""}`}><i/>{apiOnline?"API connected":"Demo mode"}</span><button className="icon-button menu-button" onClick={()=>setMobileMenu(!mobileMenu)}>{mobileMenu?<X/>:<Menu/>}</button><button className="top-cta" onClick={startQuest}>Start quest <ArrowUpRight size={15}/></button></div>
    </header>

    <main>
      {page==="home" && <Home onStart={startQuest} onStudio={()=>navigate("studio")} />}
      {page==="persona" && <div className="page-wrap"><SectionTitle eyebrow="01 / Choose your mode" title="Your life. Your AI PC." text="Pick the one that feels most like you. We'll tailor your quest and recommendation."/><div className="persona-grid">{personas.map(p=><button key={p.id} onClick={()=>setPersona(p.id)} className={`persona-card ${persona===p.id?"selected":""}`}><div className={`persona-icon ${p.color}`}><p.icon size={25}/></div><h3>{p.name}</h3><p>{p.sub}</p><div className="persona-needs">{p.needs.map(n=><span key={n}>{n}</span>)}</div><div className="select-line">{persona===p.id?<><Check size={15}/> Selected</>:"Choose this mode"}<ArrowRight size={15}/></div></button>)}</div><div className="bottom-action"><button className="button primary" disabled={!persona} onClick={()=>navigate("game")}>Begin my quest <ArrowRight size={17}/></button><span>3 challenges · about 60–90 seconds</span></div></div>}
      {page==="game" && <Quest challenge={challenge} score={score} onAnswer={answerQuestion}/>}
      {page==="result" && <Result persona={selectedPersona} score={score} budget={budget} setBudget={setBudget} recommendation={recommendation} onCopy={copyResult} onDownload={downloadSummary} onTry={()=>navigate("studio")} onAgain={startQuest} onRecommend={getRecommendation}/>}
      {page==="studio" && <div className="page-wrap"><SectionTitle eyebrow="AI STUDIO / TRY IT" title="Make AI do something useful." text="Try a quick AI workflow. This prototype uses a cloud AI service when configured, with a local fallback when offline."/><div className="studio-layout"><div className="studio-controls"><div className="mode-tabs">{[["study","Study mode",FileText],["creator","Creator mode",WandSparkles],["work","Work mode",BriefcaseBusiness]].map(([id,label,Icon])=><button key={id} className={aiMode===id?"active":""} onClick={()=>{setAiMode(id);setAiOutput("")}}><Icon size={16}/>{label}</button>)}</div><label className="field-label">YOUR TEXT / IDEA</label><textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} rows={9} placeholder="Paste notes, an idea or meeting text..."/><button className="button primary full" onClick={runAI} disabled={aiLoading}>{aiLoading?"Working...":<>Generate with AI <Sparkles size={17}/></>}</button><p className="micro-note"><ShieldCheck size={14}/> Don't paste sensitive personal information into this demo.</p></div><div className="output-card"><div className="output-head"><span><Sparkles size={16}/> QUEST AI OUTPUT</span><span className="output-label">{apiOnline?"AI SERVICE":"DEMO FALLBACK"}</span></div>{aiOutput?<pre>{aiOutput}</pre>:<div className="empty-output"><div className="empty-orb"><BrainCircuit size={30}/></div><h3>Your result appears here.</h3><p>Choose a mode, add some text and generate your first AI-assisted result.</p></div>}</div></div><div className="honesty-note"><LockKeyhole size={18}/><div><b>Transparent demo:</b> If Gemini is configured, generation happens through a cloud API. This browser demo does not claim to use the laptop's Intel NPU. A separate compatible on-device application must be demonstrated on Intel hardware.</div></div></div>}
      {page==="compare" && <Compare onStart={startQuest}/>}
      {page==="dashboard" && <Dashboard data={dashboard} onRefresh={()=>api.analytics().then(setDashboard)}/>}
    </main>

    <footer className="footer"><div className="footer-brand"><span className="intel-mark">intel</span><span>AI QUEST</span></div><span>THE FUTURE IS YOU</span><span>Competition concept prototype · Not an official Intel product</span></footer>
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}

function Home({onStart,onStudio}) {
  return <div className="home">
    <div className="hero-grid">
      <div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> THE NEXT ERA OF PERSONAL COMPUTING</div><h1>You use AI.<br/><em>Does your PC?</em></h1><p className="hero-lead">Don't just hear about AI PCs. Experience what they could unlock for the way you study, create, work and play.</p><div className="hero-buttons"><button className="button primary" onClick={onStart}>Play your AI quest <ArrowRight size={18}/></button><button className="button ghost" onClick={onStudio}><Play size={16}/> Explore AI Studio</button></div><div className="hero-proof"><span><Zap size={15}/> 2–3 minute experience</span><span><Users size={15}/> Made for curious minds</span><span><ScanLine size={15}/> Touchscreen ready</span></div></div>
      <div className="hero-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="visual-glow"/><div className="chip-card"><div className="chip-top"><span>INTEL CORE ULTRA</span><Cpu size={17}/></div><div className="chip-art"><div className="chip-core"><BrainCircuit size={57}/><span>AI</span></div><div className="chip-lines"><i/><i/><i/><i/><i/></div></div><div className="chip-bottom"><span>CPU</span><span>GPU</span><b>NPU</b></div></div><div className="float-card float-one"><Sparkles size={17}/><div><b>CREATE MORE</b><small>Ideas into impact</small></div></div><div className="float-card float-two"><ShieldCheck size={17}/><div><b>WORK SMARTER</b><small>Explore on-device AI</small></div></div><div className="visual-caption">A NEW WAY TO EXPERIENCE YOUR PC <span>01 — 04</span></div></div>
    </div>
    <div className="feature-strip"><div><span className="strip-num">01</span><b>Choose your world</b><small>Student · Creator · Hustler · Gamer</small></div><div><span className="strip-num">02</span><b>Take the challenge</b><small>Play quick, real-life scenarios</small></div><div><span className="strip-num">03</span><b>Meet your match</b><small>Get a recommendation that fits</small></div><div><span className="strip-num">04</span><b>Try it in-store</b><small>Experience a real Intel AI PC</small></div></div>
    <section className="home-bottom"><div><div className="eyebrow">MORE THAN A QUIZ</div><h2>From “Why AI PC?”<br/>to “I want this.”</h2></div><p>AI is already part of your life. Your next PC should be ready for what comes next. Discover the difference between using AI in a browser and having hardware designed to accelerate compatible AI experiences.</p><button className="text-button" onClick={onStart}>Discover your AI personality <ArrowRight size={17}/></button></section>
  </div>;
}

function Quest({challenge,score,onAnswer}) {
  const q=quiz[challenge]; const [selected,setSelected]=useState(null);
  useEffect(()=>setSelected(null),[challenge]);
  return <div className="page-wrap quest-wrap"><div className="quest-top"><div><div className="eyebrow">02 / THE QUEST · CHALLENGE {challenge+1} OF 3</div><h2>{q.title}</h2></div><div className="score-badge"><Trophy size={18}/><span>{score}<small> / 300 PTS</small></span></div></div><div className="quest-progress">{quiz.map((_,i)=><span key={i} className={i<=challenge?"filled":""}/>)}</div><div className="question-card"><div className="question-meta"><span>{q.category}</span><span>+100 POINTS</span></div><h3>{q.question}</h3><div className="answer-list">{q.options.map((o,i)=><button key={i} disabled={selected!==null} onClick={()=>{setSelected(i);setTimeout(()=>onAnswer(i),1050)}} className={`answer-option ${selected===i?(i===q.answer?"right":"wrong"):""} ${selected!==null&&i===q.answer?"reveal":""}`}><span className="answer-letter">{String.fromCharCode(65+i)}</span>{o}{selected!==null&&i===q.answer&&<Check size={18}/>}</button>)}</div>{selected!==null&&<div className="answer-explain"><Check size={17}/><span>{selected===q.answer?"That's the smart move. ":"Good try. "}{q.explanation}</span></div>}</div><div className="quest-foot"><span>Think about the outcome, not the specification.</span><span>SESSION · IN-STORE DEMO</span></div></div>;
}

function Result({persona,score,budget,setBudget,recommendation,onCopy,onDownload,onTry,onAgain,onRecommend}) {
  const [qr,setQr]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  useEffect(()=>{const u=new URL(window.location.href);u.searchParams.set("persona",persona.id);u.searchParams.set("score",score);setShareUrl(u.toString())},[persona,score]);
  return <div className="page-wrap result-wrap"><div className="result-heading"><div className="eyebrow">03 / QUEST COMPLETE</div><h2>{score===300?"Quest master unlocked.":"Your AI journey starts here."}</h2><p>You explored real-world AI use cases. Here's what your next PC should help you do.</p></div><div className="result-grid"><div className="result-score"><div className="result-label"><Trophy size={16}/> YOUR AI PERSONALITY</div><div className="persona-result-icon"><persona.icon size={30}/></div><h3>{persona.name}</h3><div className="big-score">{score}<small>/300</small></div><p>{score===300?"Perfect run. You think AI-first.":score>=100?"Nice run. You spotted where AI can help.":"Curiosity unlocked. Keep exploring."}</p><div className="score-dots">{[0,1,2].map(i=><i key={i} className={score>i*100?"on":""}/>)}</div></div><div className="recommend-card"><div className="eyebrow">YOUR PERSONALIZED MATCH</div><h3>{recommendation.title}</h3><p>{recommendation.why}</p><label className="field-label">YOUR APPROXIMATE BUDGET (₹)</label><select value={budget} onChange={e=>setBudget(e.target.value)}><option value="50000">Under ₹50,000</option><option value="70000">₹50,000 – ₹70,000</option><option value="90000">₹70,000 – ₹90,000</option><option value="120000">₹90,000 – ₹1,20,000</option><option value="150000">Above ₹1,20,000</option></select><div className="check-list">{recommendation.checks.map(x=><div key={x}><Check size={15}/>{x}</div>)}</div><button className="button primary full" onClick={onRecommend}>Refine my recommendation <ArrowRight size={17}/></button></div></div><div className="result-actions"><button className="button primary" onClick={onTry}>Try AI Studio <Sparkles size={16}/></button><button className="button secondary" onClick={onCopy}><Copy size={16}/> Copy my result</button><button className="button secondary" onClick={onDownload}><Download size={16}/> Save result</button><button className="button secondary" onClick={onAgain}><RotateCcw size={16}/> Play again</button></div><div className="try-in-store"><div className="try-icon"><ShoppingBag size={24}/></div><div><b>Your next move: try it on a real laptop.</b><p>Ask a store expert to demonstrate a compatible AI feature on an Intel Core Ultra laptop. Compare the exact configuration, battery, memory, GPU and apps you need.</p></div><ArrowUpRight size={22}/></div><div className="micro-note centered">This is a usage-based guidance prototype, not a live inventory or price feed. Exact product suitability depends on model configuration and software support.</div></div>;
}

function Compare({onStart}) {
  return <div className="page-wrap"><SectionTitle eyebrow="DISCOVER / THE AI PC" title="Three engines. One smarter experience." text="An AI PC brings together specialized compute engines. Each has a different role, and compatible software can use the right engine for the workload."/><div className="engine-grid"><div className="engine-card"><div className="engine-icon cpu"><Cpu size={28}/></div><div className="eyebrow">01 / RESPONSIVE</div><h3>CPU</h3><p>The general-purpose engine. Handles everyday computing and fast-response tasks.</p><span>Think: everyday multitasking</span></div><div className="engine-card"><div className="engine-icon gpu"><Gauge size={28}/></div><div className="eyebrow">02 / THROUGHPUT</div><h3>GPU</h3><p>Handles graphics and parallel workloads, including many demanding creative tasks.</p><span>Think: visuals and creation</span></div><div className="engine-card featured"><div className="engine-icon npu"><BrainCircuit size={28}/></div><div className="eyebrow">03 / EFFICIENT AI</div><h3>NPU</h3><p>A dedicated neural processing engine designed to efficiently accelerate supported AI workloads.</p><span>Think: compatible on-device AI</span></div></div><div className="compare-note"><ShieldCheck size={21}/><div><b>What about privacy and battery?</b><p>On-device processing can reduce the need to send some data to cloud services. An NPU can efficiently handle supported sustained AI workloads. Actual privacy, performance and battery life depend on the application, device configuration and usage.</p></div></div><SectionTitle eyebrow="MAKE A SMARTER CHOICE" title="Don't shop by colour alone." text="Compare the complete laptop: processor, GPU, memory, display, battery, cooling, software support and warranty. The best device is the one that fits your real workload."/><div className="compare-checks">{[["Performance","Test the apps and workloads you actually use."],["AI capability","Ask which AI features are supported and where they run."],["Privacy","Check app settings and on-device/cloud data handling."],["Battery","Look for independent tests and your expected usage."],["Value","Compare like-for-like configurations and after-sales support."]].map(([a,b])=><div key={a}><Check size={16}/><b>{a}</b><span>{b}</span></div>)}</div><div className="bottom-action"><button className="button primary" onClick={onStart}>Find my AI personality <ArrowRight size={17}/></button><span>Make your next laptop choice count.</span></div></div>;
}

function Dashboard({data,onRefresh}) {
  const stats=data?.summary || {sessions:0,completion_rate:0,average_score:0,personas:{}};
  const personaRows=Object.entries(stats.personas||{});
  return <div className="page-wrap"><div className="dashboard-heading"><SectionTitle eyebrow="RETAIL INSIGHTS / STAFF VIEW" title="Every interaction tells a story." text="A lightweight view of engagement from this demo installation. Data is stored locally in SQLite when the backend is running."/><button className="button secondary" onClick={onRefresh}><RotateCcw size={15}/> Refresh data</button></div><div className="metric-grid"><Metric icon={Users} label="Quest sessions" value={stats.sessions}/><Metric icon={Check} label="Completion rate" value={`${stats.completion_rate}%`}/><Metric icon={Trophy} label="Average score" value={`${stats.average_score}/300`}/><Metric icon={BarChart3} label="Personas" value={personaRows.length}/></div><div className="dashboard-panel"><div className="panel-heading"><div><div className="eyebrow">AUDIENCE SNAPSHOT</div><h3>Persona mix</h3></div><span className="output-label">LOCAL DEMO DATA</span></div>{personaRows.length?personaRows.map(([name,count])=><div className="bar-row" key={name}><span>{name}</span><div className="bar-track"><i style={{width:`${stats.sessions?count/stats.sessions*100:0}%`}}/></div><b>{count}</b></div>):<div className="empty-dashboard"><BarChart3 size={28}/><b>No sessions recorded yet.</b><span>Play the quest once to see engagement data here.</span></div>}</div><p className="micro-note">Privacy by design: this prototype stores anonymous session metadata only. Do not collect names, emails, phone numbers or sensitive content in the retail demo.</p></div>;
}
function Metric({icon:Icon,label,value}) { return <div className="metric-card"><div className="metric-icon"><Icon size={19}/></div><span>{label}</span><b>{value}</b></div>; }
