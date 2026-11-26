import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Sparkles, Cpu, ShieldCheck, Zap, BrainCircuit,
  GraduationCap, Palette, BriefcaseBusiness, Gamepad2, Trophy, RotateCcw,
  Check, ChevronRight, Menu, X, ScanLine, Wifi, WifiOff, Download, Copy,
  Monitor, LockKeyhole, BatteryCharging, Gauge, BarChart3, Users, ShoppingBag,
  WandSparkles, FileText, Image, Mic, CircleHelp, Play, ExternalLink,
  Heart, Timer, Shield, Scissors, Star
} from "lucide-react";
import { api } from "./api";

/* ---------- GAME SETTINGS ---------- */
const TIME_LIMIT = 60;                       // seconds per challenge
const START_LIVES = 3;
const POWER_START = { fifty: 1, time: 1, shield: 1 };
const TIME_BOOST = 15;                       // seconds added by the +15 power-up

const personas = [
  { id:"student", name:"The Student", sub:"Learn smarter. Build faster.", icon:GraduationCap, color:"blue", needs:["Study notes","Research","Coding"], challenge:"Turn a long set of class notes into a clean revision plan." },
  { id:"creator", name:"The Creator", sub:"Make your ideas impossible to ignore.", icon:Palette, color:"purple", needs:["Design","Video editing","Content"], challenge:"Turn one idea into a social caption and a creative brief." },
  { id:"hustler", name:"The Hustler", sub:"Do more without the chaos.", icon:BriefcaseBusiness, color:"green", needs:["Multitasking","Meetings","Productivity"], challenge:"Convert meeting notes into clear owners and next steps." },
  { id:"gamer", name:"The Gamer", sub:"Play hard. Create harder.", icon:Gamepad2, color:"orange", needs:["Gaming","Streaming","Graphics"], challenge:"Choose a setup based on your games, display and GPU needs." }
];

/* ---------- ORIGINAL QUESTIONS (unchanged) ---------- */
const quiz = [
  { title:"The 30-second reset", category:"PRODUCTIVITY", question:"You have 4 pages of messy project notes and a deadline. What's the smartest move?", options:["Retype everything manually","Use an AI assistant to summarize, organize and create action points","Open 20 browser tabs","Ignore the notes"], answer:1, explanation:"AI tools can help summarize long information and turn it into useful next steps. Some compatible workloads can run locally on an AI PC." },
  { title:"Creator emergency", category:"CREATIVITY", question:"Your video is ready, but the audio is noisy and the background is distracting. What do you explore?", options:["Start the entire video again","Use compatible AI-assisted editing, noise reduction or background effects","Lower screen brightness","Buy a new camera immediately"], answer:1, explanation:"Supported AI apps can help with creative and collaboration tasks. Always check the app and laptop requirements." },
  { title:"Your data, your call", category:"PRIVACY", question:"You want to use an AI feature with personal files. What should you check first?", options:["Assume every AI app works offline","Check whether it runs on-device, what data goes to the cloud and its privacy settings","Share your password","Turn off security settings"], answer:1, explanation:"On-device processing can reduce the need to send some data to cloud services, but actual behavior depends on the app and its settings." }
];

/* ---------- NEW PERSONA-SPECIFIC QUESTIONS ---------- */
const extraQuestions = {
  studentTabs: { title:"Exam week overload", category:"STUDY SETUP", question:"You're coding, researching in 15 browser tabs and on a video call. What helps keep things smooth?", options:["Only the colour of the laptop","Maximum screen brightness","Enough RAM and fast SSD storage, plus a capable processor","The thinnest possible charger"], answer:2, explanation:"Memory, storage and the processor all affect multitasking. Compare the full configuration rather than a single spec." },
  creatorRender: { title:"Render day", category:"EDITING POWER", question:"You edit 4K video and export with lots of effects. What should you check before buying?", options:["The GPU and graphics memory, RAM, and whether your editing apps support them","Only the speaker design","How many stickers come in the box","Nothing, all laptops export equally fast"], answer:0, explanation:"Creative apps can use the CPU, GPU and other engines differently. Check what your software supports and test it." },
  hustlerCalls: { title:"Back-to-back calls", category:"WORK FLOW", question:"You have six video calls today and no time near a charger. What do you look at?", options:["Ignore battery life completely","Battery capacity and independent reviews, plus efficient support for features like background blur or noise reduction","Keep brightness at maximum","Close the laptop during calls"], answer:1, explanation:"Supported AI features can run on efficient engines such as the NPU, but battery life depends on the app, settings and usage." },
  gamerRig: { title:"Pick your rig", category:"GAMING", question:"You want smooth gameplay in your favourite games. What should you compare first?", options:["The GPU, cooling and display refresh rate for those games","Only the processor name","The sticker on the keyboard","The colour of the box"], answer:0, explanation:"Choose based on the exact GPU, cooling, display refresh rate and target games, not the processor name alone." },
  gamerStream: { title:"Play and stream", category:"STREAMING", question:"You want to play a game and stream it at the same time. What's the smartest approach?", options:["Assume any laptop handles both equally","Close the game while streaming","Turn off cooling to save power","Check how the CPU, GPU and your streaming software share the load, and look at sustained performance"], answer:3, explanation:"Gaming and streaming stress several parts at once. Look at sustained performance and software support, not one spec." }
};

/* Which 3 missions each persona plays */
const missionSets = {
  student: [extraQuestions.studentTabs, quiz[0], quiz[2]],
  creator: [quiz[1], extraQuestions.creatorRender, quiz[2]],
  hustler: [extraQuestions.hustlerCalls, quiz[0], quiz[2]],
  gamer:   [extraQuestions.gamerRig, extraQuestions.gamerStream, quiz[2]]
};

const shuffle = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

/* Shuffles answer order each run so the right answer isn't always in the same spot */
const buildMissions = (personaId) => (missionSets[personaId] || missionSets.student).map(q => {
  const order = shuffle(q.options.map((text, idx) => ({ text, idx })));
  return { ...q, options: order.map(o => o.text), answer: order.findIndex(o => o.idx === q.answer) };
});

const fallbackRecommendations = {
  student: { title:"The Study & Build setup", why:"Prioritize a capable Intel Core Ultra configuration, sufficient RAM and fast SSD storage for IDEs, research, many browser tabs and supported AI tools.", checks:["16 GB RAM or more where budget allows","512 GB SSD or more","Comfortable keyboard and display"] },
  creator: { title:"The Creator setup", why:"Prioritize the full graphics configuration, memory, display quality and the creative applications you actually use.", checks:["Check GPU and graphics memory","16–32 GB RAM depending on editing","Color-accurate display and fast SSD"] },
  hustler: { title:"The Productivity setup", why:"Balance CPU responsiveness, efficient supported AI workloads, video-call features, battery capacity and portability.", checks:["16 GB RAM or more","Battery capacity and real reviews","Webcam, microphone and display"] },
  gamer: { title:"The Gaming & Stream setup", why:"Choose based on the exact GPU, cooling, display refresh rate and target games—not the processor name alone.", checks:["Compare dedicated/integrated GPU","Cooling and sustained performance","Display refresh rate and RAM"] }
};

/* Which engine helps in each kind of mission (shown after every answer) */
const ENGINE_TIPS = {
  "PRODUCTIVITY": { engine:"NPU", text:"Supported AI tasks like summarizing can run on the NPU, the efficient AI engine, while the CPU keeps everything else responsive.", edge:"Core Ultra can spread supported AI work across the CPU, graphics and NPU." },
  "CREATIVITY": { engine:"GPU + NPU", text:"Visual effects lean on the GPU, while some supported noise-reduction and background features can use the NPU.", edge:"Intel Arc graphics and the NPU sit together on Core Ultra, so supported creative apps can use both." },
  "PRIVACY": { engine:"NPU", text:"Running supported AI on the device can keep some data on your laptop. Always check each app's settings.", edge:"Intel's free AI Playground runs on the device, so prompts and results stay on your PC. It needs a compatible Core Ultra with Intel Arc graphics." },
  "STUDY SETUP": { engine:"CPU", text:"The CPU handles everyday multitasking, and works best alongside enough memory and fast storage.", edge:"Intel Core Ultra runs standard Windows (x86) software natively, the kind students rely on." },
  "EDITING POWER": { engine:"GPU", text:"The GPU speeds up graphics and many export tasks, if your editing app supports it.", edge:"Core Ultra laptops include Intel Arc graphics. Ask the store to run your own editing app on one." },
  "WORK FLOW": { engine:"NPU", text:"Supported call features like background blur can run on the NPU, which is designed to be efficient and may help battery life.", edge:"Core Ultra's NPU is built for steady, efficient AI work like call effects in supported apps." },
  "GAMING": { engine:"GPU", text:"The GPU draws your game. Cooling and display refresh rate decide how smooth it stays.", edge:"x86 means your Windows game library is built for it, and Core Ultra includes Intel Arc graphics." },
  "STREAMING": { engine:"CPU + GPU", text:"Gameplay and encoding can share the CPU and GPU, so sustained performance matters.", edge:"Core Ultra combines CPU and Arc graphics, and keeps the NPU free for supported AI jobs." }
};

/* "Spot the spec trap" showdown rounds (example laptops, for illustration only) */
const SHOWDOWN = [
  { title:"The colour trap", prompt:"Same budget. Which one would you take home for the next 4 years?",
    a:{ name:"Sunset Orange Laptop", specs:["Eye-catching colour","Lower price","Older processor","8 GB RAM"] },
    b:{ name:"Plain Grey Laptop", specs:["Intel Core Ultra","16 GB RAM","Fast SSD","Built-in AI engines"] },
    answer:"b", why:"Colour doesn't help in year three. Memory, the processor and AI support decide how the laptop feels long after the shop glow fades." },
  { title:"The big-number trap", prompt:"Your must-have apps and games are standard Windows (x86) programs. Which one fits?",
    a:{ name:"Intel Core Ultra Laptop", specs:["x86: built for Windows apps","Up to 50 TOPS NPU","Intel Arc graphics"] },
    b:{ name:"Big-TOPS Sticker Laptop", specs:["Arm-based","Up to 80 TOPS NPU","Some apps may need emulation"] },
    answer:"a", why:"TOPS is a peak NPU number. If your daily apps and games are built for x86, running them natively matters more than a bigger sticker. Arm laptops run many apps well, but always check yours." },
  { title:"The AI-sticker trap", prompt:"You want AI that keeps your files private. Which one do you ask about?",
    a:{ name:"\"AI Inside\" Sticker Laptop", specs:["AI features need the cloud","Unclear where data goes","No local AI app to try"] },
    b:{ name:"Intel Core Ultra Laptop", specs:["CPU + Arc graphics + NPU","Can run Intel AI Playground locally","Prompts stay on your PC"] },
    answer:"b", why:"A sticker isn't a feature. Intel's free AI Playground runs on the device on compatible Core Ultra PCs with Arc graphics. Always ask where each AI feature actually runs." }
];

/* Extra checklist items based on which categories the player missed */
const FOCUS = {
  "PRODUCTIVITY": "Ask which AI note and summary tools are supported on this laptop",
  "CREATIVITY": "Test your editing app's AI-assisted features on the actual laptop",
  "PRIVACY": "Ask where each AI feature runs: on the device or in the cloud",
  "STUDY SETUP": "Check RAM and SSD size for your tabs, coding and calls",
  "EDITING POWER": "Check GPU, graphics memory and software support for your editor",
  "WORK FLOW": "Look up independent battery tests and try the call features",
  "GAMING": "Compare GPU, cooling and refresh rate for your games",
  "STREAMING": "Ask about sustained performance while gaming and streaming"
};

/* What to ask the store expert to demo, per persona */
const DEMO_ASK = {
  student: "an AI note-summarizing or study tool",
  creator: "AI-assisted photo or video editing in an app you use",
  hustler: "video-call effects like background blur and noise reduction",
  gamer: "one of your favourite games running, plus the display refresh rate"
};

function IconBox({ icon:Icon, tone="cyan" }) { return <div className={`icon-box ${tone}`}><Icon size={20}/></div>; }
function SectionTitle({ eyebrow, title, text }) { return <div className="section-title"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{text && <p>{text}</p>}</div>; }

export default function App() {
  const [page,setPage] = useState("home");
  const [persona,setPersona] = useState(null);
  const [challenge,setChallenge] = useState(0);
  const [answers,setAnswers] = useState([]);
  const [score,setScore] = useState(0);
  const [lives,setLives] = useState(START_LIVES);
  const [bonus,setBonus] = useState(0);
  const [power,setPower] = useState(POWER_START);
  const [shieldActive,setShieldActive] = useState(false);
  const [runId,setRunId] = useState(0);
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
  const missions = useMemo(() => buildMissions(persona || "student"), [persona, runId]);
  const maxScore = missions.length * 100;

  const navigate = (p) => { setPage(p); setMobileMenu(false); if(p==="dashboard") api.analytics().then(setDashboard); window.scrollTo({top:0,behavior:"smooth"}); };

  const startQuest = () => {
    setChallenge(0); setAnswers([]); setScore(0); setRecommendationOverride(null);
    setLives(START_LIVES); setBonus(0); setPower(POWER_START); setShieldActive(false);
    setRunId(r => r + 1);
    navigate("persona");
  };

  /* choice === null means the timer ran out */
  const answerQuestion = (choice, timeLeft) => {
    const q = missions[challenge];
    const correct = choice === q.answer;
    let nextScore = score, nextBonus = bonus, nextLives = lives;

    if (correct) { nextScore += 100; nextBonus += Math.floor(timeLeft / 3); }
    else if (shieldActive) { setShieldActive(false); setToast("Shield absorbed the hit. No life lost!"); }
    else nextLives = Math.max(0, lives - 1);

    const nextAnswers = [...answers, { choice, correct, category:q.category }];
    setScore(nextScore); setBonus(nextBonus); setLives(nextLives); setAnswers(nextAnswers);

    setTimeout(() => {
      if (nextLives === 0 || challenge >= missions.length - 1) finishQuest(nextScore, nextBonus, nextLives, nextAnswers);
      else setChallenge(c => c + 1);
    }, 1800);
  };

  const spendPower = (key) => {
    if (!power[key]) return;
    setPower(p => ({ ...p, [key]: p[key] - 1 }));
    if (key === "shield") { setShieldActive(true); setToast("Shield on. Your next miss is free."); }
  };

  const finishQuest = async (finalScore, finalBonus, finalLives, finalAnswers) => {
    const result = { session_id:sessionId, persona, score:finalScore, answers:finalAnswers.length, budget_inr:Number(budget), lives_left:finalLives, speed_bonus:finalBonus };
    try { await api.saveSession(result); } catch (e) { /* demo still works offline */ }
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
    const text = `INTEL AI QUEST\nPersona: ${selectedPersona.name}\nScore: ${score}/${maxScore} (+${bonus} speed bonus)\nLives left: ${lives}/${START_LIVES}\nRecommendation: ${recommendation.title}\n${recommendation.why}`;
    try { await navigator.clipboard.writeText(text); setToast("Recommendation copied!"); }
    catch { setToast("Select and copy your result."); }
  };

  const downloadSummary = () => {
    const content = `INTEL AI QUEST — SHOPPER SUMMARY\nSession: ${sessionId}\nPersona: ${selectedPersona.name}\nScore: ${score}/${maxScore} (+${bonus} speed bonus)\nLives left: ${lives}/${START_LIVES}\nBudget: ₹${Number(budget).toLocaleString("en-IN")}\n\n${recommendation.title}\n${recommendation.why}\n\nConfiguration checklist:\n${recommendation.checks.map(x=>"- "+x).join("\n")}\n\nAsk the store expert to demonstrate a supported AI feature on the actual laptop.`;
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
      {page==="persona" && <div className="page-wrap"><SectionTitle eyebrow="01 / Choose your mode" title="Your life. Your AI PC." text="Pick the one that feels most like you. We'll tailor your quest and recommendation."/><div className="persona-grid">{personas.map(p=><button key={p.id} onClick={()=>setPersona(p.id)} className={`persona-card ${persona===p.id?"selected":""}`}><div className={`persona-icon ${p.color}`}><p.icon size={25}/></div><h3>{p.name}</h3><p>{p.sub}</p><div className="persona-needs">{p.needs.map(n=><span key={n}>{n}</span>)}</div><div className="select-line">{persona===p.id?<><Check size={15}/> Selected</>:"Choose this mode"}<ArrowRight size={15}/></div></button>)}</div><div className="bottom-action"><button className="button primary" disabled={!persona} onClick={()=>navigate("game")}>Begin my quest <ArrowRight size={17}/></button><span>3 missions · up to {TIME_LIMIT} seconds each · {START_LIVES} lives</span></div></div>}
      {page==="game" && <Quest key={challenge} missions={missions} challenge={challenge} score={score} maxScore={maxScore} bonus={bonus} lives={lives} power={power} shieldActive={shieldActive} persona={selectedPersona} onAnswer={answerQuestion} onPower={spendPower}/>}
      {page==="result" && <Result sessionId={sessionId} persona={selectedPersona} score={score} maxScore={maxScore} lives={lives} bonus={bonus} answers={answers} budget={budget} setBudget={setBudget} recommendation={recommendation} onCopy={copyResult} onDownload={downloadSummary} onTry={()=>navigate("studio")} onAgain={startQuest} onRecommend={getRecommendation}/>}
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

function Quest({missions,challenge,score,maxScore,bonus,lives,power,shieldActive,persona,onAnswer,onPower}) {
  const q = missions[challenge];
  const [selected,setSelected] = useState(null);      // null = still thinking, -1 = time ran out
  const [hidden,setHidden] = useState([]);            // options removed by 50/50
  const [timeLeft,setTimeLeft] = useState(TIME_LIMIT);

  /* countdown: runs only while the player hasn't answered */
  useEffect(() => {
    if (selected !== null) return;
    if (timeLeft <= 0) { setSelected(-1); onAnswer(null, 0); return; }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected]);

  const pick = (i) => { if (selected !== null) return; setSelected(i); onAnswer(i, timeLeft); };

  const useFifty = () => {
    if (selected !== null || !power.fifty) return;
    const wrong = q.options.map((_, i) => i).filter(i => i !== q.answer);
    setHidden(wrong.sort(() => Math.random() - 0.5).slice(0, 2));
    onPower("fifty");
  };
  const useTime = () => { if (selected !== null || !power.time) return; setTimeLeft(t => t + TIME_BOOST); onPower("time"); };
  const useShield = () => { if (selected !== null || !power.shield || shieldActive) return; onPower("shield"); };

  const locked = selected !== null;
  const timedOut = selected === -1;

  return <div className="page-wrap quest-wrap">
    <div className="quest-top">
      <div>
        <div className="eyebrow">02 / THE QUEST · CHALLENGE {challenge+1} OF {missions.length}</div>
        <h2>{q.title}</h2>
        <p className="mission-brief"><Zap size={14}/><span>MISSION: {persona.challenge}</span></p>
      </div>
      <div className="score-badge"><Trophy size={18}/><span>{score}<small> / {maxScore} PTS</small></span></div>
    </div>

    <div className="quest-progress">{missions.map((_,i)=><span key={i} className={i<=challenge?"filled":""}/>)}</div>

    <div className="game-hud">
      <div className="lives" aria-label={`${lives} lives left`}>
        {Array.from({length:START_LIVES}).map((_,i)=><Heart key={i} size={22} className={`life ${i<lives?"on":"off"}`}/>)}
        {shieldActive && <span className="shield-on"><Shield size={14}/><span>SHIELD ON</span></span>}
      </div>
      <div className={`timer ${timeLeft<=10 && !locked ? "danger" : ""}`}>
        <Timer size={18}/><b>{timeLeft}s</b>
        <div className="timer-track"><i style={{width:`${Math.min(100, timeLeft/TIME_LIMIT*100)}%`}}/></div>
      </div>
      <div className="bonus-chip">SPEED BONUS +{bonus}</div>
    </div>

    <div className="question-card">
      <div className="question-meta"><span>{q.category}</span><span>+100 POINTS</span></div>
      <h3>{q.question}</h3>
      <div className="answer-list">{q.options.map((o,i)=>
        <button key={i} disabled={locked || hidden.includes(i)} onClick={()=>pick(i)}
          className={`answer-option ${selected===i?(i===q.answer?"right":"wrong"):""} ${locked&&i===q.answer?"reveal":""} ${hidden.includes(i)?"eliminated":""}`}>
          <span className="answer-letter">{String.fromCharCode(65+i)}</span>{o}{locked&&i===q.answer&&<Check size={18}/>}
        </button>)}
      </div>

      <div className="power-row">
        <span className="power-label">POWER-UPS</span>
        <button className="power-btn" disabled={locked||!power.fifty} onClick={useFifty}><Scissors size={15}/><span>50/50</span><em>x{power.fifty}</em></button>
        <button className="power-btn" disabled={locked||!power.time} onClick={useTime}><Timer size={15}/><span>+{TIME_BOOST} SEC</span><em>x{power.time}</em></button>
        <button className="power-btn" disabled={locked||!power.shield||shieldActive} onClick={useShield}><Shield size={15}/><span>SHIELD</span><em>x{power.shield}</em></button>
      </div>

      {locked && <div className="answer-explain"><Check size={17}/><span>{timedOut?"Time's up! ":selected===q.answer?"That's the smart move. ":"Good try. "}{q.explanation}{lives===0?" You're out of lives, so let's see your result.":""}</span></div>}
      {locked && ENGINE_TIPS[q.category] && <div className="engine-tip"><div className="tip-row"><span className="engine-pill">{ENGINE_TIPS[q.category].engine}</span><span>{ENGINE_TIPS[q.category].text}</span></div><div className="tip-row"><span className="engine-pill edge">INTEL EDGE</span><span>{ENGINE_TIPS[q.category].edge}</span></div></div>}
    </div>
    <div className="quest-foot"><span>Think about the outcome, not the specification.</span><span>SESSION · IN-STORE DEMO</span></div>
  </div>;
}

function Showdown() {
  const [round,setRound] = useState(0);
  const [picked,setPicked] = useState(null);
  const [wins,setWins] = useState(0);
  const [done,setDone] = useState(false);
  const r = SHOWDOWN[round];
  const pick = (side) => { if (picked) return; setPicked(side); if (side === r.answer) setWins(w => w + 1); };
  const next = () => { if (round < SHOWDOWN.length - 1) { setRound(round + 1); setPicked(null); } else setDone(true); };
  const again = () => { setRound(0); setPicked(null); setWins(0); setDone(false); };
  const card = (side) => {
    const item = r[side];
    const state = picked ? (side === r.answer ? "win" : (picked === side ? "lose" : "dim")) : "";
    return <div role="button" tabIndex={picked ? -1 : 0} className={`shelf-card ${state}`} onClick={()=>pick(side)} onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pick(side); } }}>
      <div className="shelf-name">{item.name}</div>
      <div className="shelf-specs">{item.specs.map(x=><span key={x}>{x}</span>)}</div>
      {picked && side === r.answer && <div className="shelf-verdict"><Check size={15}/><span>SMARTER BUY</span></div>}
    </div>;
  };
  return <div className="showdown">
    <div className="showdown-head"><div><div className="eyebrow">SHOWDOWN / SPOT THE SPEC TRAP</div><h3>{done ? "Showdown complete." : r.title}</h3></div><div className="showdown-score"><Trophy size={16}/><span>{wins} / {SHOWDOWN.length}</span></div></div>
    {!done ? <>
      <p className="showdown-prompt">{r.prompt}</p>
      <div className="shelf-grid">{card("a")}<div className="vs-mark">VS</div>{card("b")}</div>
      {picked && <div className="answer-explain"><Check size={17}/><span>{picked === r.answer ? "Sharp eye. " : "Easy to miss. "}{r.why}</span></div>}
      {picked && <button className="button primary" onClick={next}>{round < SHOWDOWN.length - 1 ? "Next round" : "See my result"} <ArrowRight size={16}/></button>}
    </> : <>
      <p className="showdown-prompt">{wins === SHOWDOWN.length ? "You spotted every spec trap. You shop by what matters, not by the sticker." : wins >= 1 ? `You spotted ${wins} of ${SHOWDOWN.length} spec traps. Check memory, app support and where AI runs before you buy.` : "Every shelf has a trap. Next time, check memory, app support and where AI runs before you buy."}</p>
      <button className="button secondary" onClick={again}><RotateCcw size={15}/> Replay showdown</button>
    </>}
    <p className="micro-note">Example laptops for illustration only, not real products or prices.</p>
  </div>;
}

function Result({sessionId,persona,score,maxScore,lives,bonus,answers,budget,setBudget,recommendation,onCopy,onDownload,onTry,onAgain,onRecommend}) {
  const [qr,setQr]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  useEffect(()=>{const u=new URL(window.location.href);u.searchParams.set("persona",persona.id);u.searchParams.set("score",score);setShareUrl(u.toString())},[persona,score]);
  const outOfLives = lives === 0;
  const missedCats = [...new Set(answers.filter(a=>!a.correct).map(a=>a.category))];
  const focusItems = missedCats.map(c=>FOCUS[c]).filter(Boolean);
  const demoAsk = DEMO_ASK[persona.id];
  const rank = outOfLives ? "RESPAWN READY" : score===maxScore ? "QUEST MASTER" : score>=200 ? "AI EXPLORER" : "AI ROOKIE";
  return <div className="page-wrap result-wrap"><div className="result-heading"><div className="eyebrow">03 / QUEST COMPLETE</div><h2>{outOfLives?"Out of lives, not out of ideas.":score===maxScore?"Quest master unlocked.":"Your AI journey starts here."}</h2><p>You explored real-world AI use cases. Here's what your next PC should help you do.</p></div><div className="result-grid"><div className="result-score"><div className="result-label"><Trophy size={16}/> YOUR AI PERSONALITY</div><div className="persona-result-icon"><persona.icon size={30}/></div><h3>{persona.name}</h3><div className="reward-badge"><Star size={16}/><span>{rank}</span></div><div className="big-score">{score}<small>/{maxScore}</small></div><p>{score===maxScore?"Perfect run. You think AI-first.":score>=100?"Nice run. You spotted where AI can help.":"Curiosity unlocked. Keep exploring."}</p><div className="score-dots">{[0,1,2].map(i=><i key={i} className={score>i*100?"on":""}/>)}</div><div className="result-stats"><span><Heart size={14} className="life on"/><span>{lives}/{START_LIVES} LIVES LEFT</span></span><span><Timer size={14}/><span>+{bonus} SPEED BONUS</span></span></div><div className="skill-chips">{answers.map((a,i)=><span key={i} className={a.correct?"ok":"miss"}>{a.correct?<Check size={13}/>:<X size={13}/>}<span>{a.category}</span></span>)}</div></div><div className="recommend-card"><div className="eyebrow">YOUR PERSONALIZED MATCH</div><h3>{recommendation.title}</h3><p>{recommendation.why}</p><label className="field-label">YOUR APPROXIMATE BUDGET (₹)</label><select value={budget} onChange={e=>setBudget(e.target.value)}><option value="50000">Under ₹50,000</option><option value="70000">₹50,000 – ₹70,000</option><option value="90000">₹70,000 – ₹90,000</option><option value="120000">₹90,000 – ₹1,20,000</option><option value="150000">Above ₹1,20,000</option></select><div className="check-list">{recommendation.checks.map(x=><div key={x}><Check size={15}/>{x}</div>)}</div><label className="field-label">BECAUSE OF HOW YOU PLAYED</label><div className="check-list focus-list">{focusItems.length?focusItems.map(x=><div key={x}><Zap size={15}/>{x}</div>):<div><Zap size={15}/>You got every mission right, so ask for live demos instead of reading specs.</div>}</div><button className="button primary full" onClick={onRecommend}>Refine my recommendation <ArrowRight size={17}/></button></div></div><Showdown/><div className="why-intel"><div className="eyebrow">WHY INTEL? / A FAIR COMPARISON</div><h3>Where Intel Core Ultra stands out.</h3><div className="intel-points"><div className="intel-point"><span className="intel-point-icon"><Monitor size={20}/></span><b>Runs the apps you already use</b><p>Intel Core Ultra laptops use the x86 architecture that most Windows software, games and drivers were built for. Arm-based Windows laptops run many apps well, but some tools, games or drivers may need emulation or may not be supported yet.</p></div><div className="intel-point"><span className="intel-point-icon"><Cpu size={20}/></span><b>CPU, graphics and NPU, working together</b><p>Core Ultra pairs the CPU with integrated Intel Arc graphics and an NPU. In supported apps, AI work can be shared across all three, so the right engine handles each job.</p></div><div className="intel-point"><span className="intel-point-icon"><Sparkles size={20}/></span><b>A free local AI app, from Intel</b><p>Intel AI Playground is a free app for Core Ultra PCs with Intel Arc graphics. It can create and enhance images and answer questions on the device, so prompts and results stay on your PC.</p></div><div className="intel-point"><span className="intel-point-icon"><BatteryCharging size={20}/></span><b>Reviewed for real-world use</b><p>Early independent reviews of Core Ultra Series 3 laptops praised the integrated graphics and battery life. Results vary by laptop, so check reviews for the exact model.</p></div></div><div className="table-scroll"><table className="intel-table"><thead><tr><th></th><th className="us">Intel Core Ultra (Series 3)</th><th>Qualcomm Snapdragon X2</th><th>AMD Ryzen AI 400</th></tr></thead><tbody><tr><td>Architecture</td><td className="us">x86</td><td>Arm</td><td>x86</td></tr><tr><td>Advertised NPU</td><td className="us">Up to 50 TOPS</td><td>Up to 80 TOPS</td><td>Up to 60 TOPS</td></tr><tr><td>Integrated graphics</td><td className="us">Intel Arc</td><td>Qualcomm Adreno</td><td>AMD Radeon</td></tr><tr><td>Meets Copilot+ PC 40 TOPS bar</td><td className="us">Yes</td><td>Yes</td><td>Yes</td></tr></tbody></table></div><p className="micro-note">Manufacturer-advertised figures as of November 2026. TOPS shows peak NPU speed, not everyday experience, so the best test is trying your own apps on the actual laptop. AI Playground details are from Intel and need a compatible Core Ultra PC with Arc graphics and downloaded models.</p></div><div className="store-pass"><div className="eyebrow">YOUR NEXT STEP / STORE PASS</div><div className="pass-head"><b>{persona.name} · {score}/{maxScore} · {rank}</b><span>SESSION {sessionId}</span></div><div className="pass-steps"><div><span className="step-no">1</span><span>Show this screen to the store expert and ask for an Intel Core Ultra laptop in your budget.</span></div><div><span className="step-no">2</span><span>Ask to see {demoAsk}, if the model supports it.</span></div><div><span className="step-no">3</span><span>Compare the checklist above on the actual model before you decide.</span></div></div></div><div className="result-actions"><button className="button primary" onClick={onTry}>Try AI Studio <Sparkles size={16}/></button><button className="button secondary" onClick={onCopy}><Copy size={16}/> Copy my result</button><button className="button secondary" onClick={onDownload}><Download size={16}/> Save result</button><button className="button secondary" onClick={onAgain}><RotateCcw size={16}/> Play again</button></div><div className="try-in-store"><div className="try-icon"><ShoppingBag size={24}/></div><div><b>Your next move: try it on a real laptop.</b><p>Ask a store expert to demonstrate a compatible AI feature on an Intel Core Ultra laptop. Compare the exact configuration, battery, memory, GPU and apps you need.</p></div><ArrowUpRight size={22}/></div><div className="micro-note centered">This is a usage-based guidance prototype, not a live inventory or price feed. Exact product suitability depends on model configuration and software support.</div></div>;
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