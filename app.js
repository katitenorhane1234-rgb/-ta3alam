'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rnd=a=>a[Math.random()*a.length|0],shuf=a=>[...a].sort(()=>Math.random()-.5);
const Z='\u200D',HK=[['\u064E','الفتحة'],['\u064F','الضمة'],['\u0650','الكسرة']],MD=['ا','و','ي'];
const LV=['التعرف على الحروف','أشكال الحروف','الحركات القصيرة','المدود والمقاطع','الكلمات الأساسية','الكتابة','الأرقام والحساب'];
const NM=['واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة'];
// حرف|اسم|يتصل بما بعده|كلمة|صورة
const LT=`ا|ألف|0|أَسَد|🦁
ب|باء|1|بَاب|🚪
ت|تاء|1|تُفَّاح|🍎
ث|ثاء|1|ثَعْلَب|🦊
ج|جيم|1|جَمَل|🐪
ح|حاء|1|حِصَان|🐴
خ|خاء|1|خَرُوف|🐑
د|دال|0|دَجَاجَة|🐔
ذ|ذال|0|ذُرَة|🌽
ر|راء|0|رَجُل|👨
ز|زاي|0|زَهْرَة|🌸
س|سين|1|سَمَكَة|🐟
ش|شين|1|شَمْس|☀️
ص|صاد|1|صَقْر|🦅
ض|ضاد|1|ضِفْدَع|🐸
ط|طاء|1|طَائِرَة|✈️
ظ|ظاء|1|ظَرْف|✉️
ع|عين|1|عِنَب|🍇
غ|غين|1|غَيْمَة|☁️
ف|فاء|1|فِيل|🐘
ق|قاف|1|قَمَر|🌙
ك|كاف|1|كِتَاب|📖
ل|لام|1|لَيْمُون|🍋
م|ميم|1|مَوْز|🍌
ن|نون|1|نَحْلَة|🐝
ه|هاء|1|هَدِيَّة|🎁
و|واو|0|وَرْدَة|🌹
ي|ياء|1|يَد|✋`.split('\n').map(r=>{const[c,n,j,w,e]=r.split('|');return{c,n,j:+j,w,e}});
// تصنيف,صورة,مقاطع (الفصل بين المقاطع بشرطة)
const WD=`الأسرة,👩,أُمّ
الأسرة,👨,أَ-بْ
المنزل,🚪,بَا-بْ
المنزل,🏠,بَيْت
الطعام,🍞,خُبْز
الطعام,🍎,تُفْ-فَاح
الطعام,🍌,مَوْز
الحيوانات,🐱,قِطْ-طَة
الحيوانات,🐘,فِيل
الحيوانات,🐪,جَ-مَل
جسم الإنسان,✋,يَد
جسم الإنسان,👁️,عَيْن
الطبيعة,☀️,شَمْس
الطبيعة,🌙,قَ-مَر
الطبيعة,🌳,شَ-جَ-رَة
أشياء يومية,📖,كِ-تَاب
أشياء يومية,✏️,قَ-لَم
أفعال,🍽️,يَأْ-كُلْ
أفعال,🥤,يَشْ-رَبْ`.split('\n').map(r=>{const[k,e,s]=r.split(',');const p=s.split('-');return{k,e,p,t:p.join('')}});

let S={done:{},scores:[],attempts:0,writes:0,last:1},v={r:'home'},Q=null,wr={it:'l0',m:0};
try{Object.assign(S,JSON.parse(localStorage.getItem('t3alam')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('t3alam',JSON.stringify(S))}catch(e){}};
const lock=n=>n>1&&!S.done[n-1];
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2800)};
let warned=0;
function say(t){try{const s=window.speechSynthesis;if(!s)throw 0;s.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ar-SA';u.rate=.75;
const a=s.getVoices().find(x=>x.lang&&x.lang.toLowerCase().startsWith('ar'));if(a)u.voice=a;else if(!warned++)toast('لا يوجد صوت عربي على جهازك، قد يكون النطق غير دقيق');s.speak(u)}catch(e){toast('الصوت غير متوفر على هذا الجهاز')}}
const spk=t=>`<button class="spk" data-say="${t}" aria-label="استمع">🔊</button>`;
const F=l=>l.j?[['منفصل',l.c],['بداية',l.c+Z],['وسط',Z+l.c+Z],['نهاية',Z+l.c]]:[['منفصل',l.c],['نهاية',Z+l.c]];
const fm=l=>F(l).map(f=>`<span class="f"><small>${f[0]}</small>${f[1]}</span>`).join('');
const firstUndone=()=>{for(let n=1;n<=7;n++)if(!S.done[n])return n;return 7};
const lk=()=>`<div class="det">🔒 أكمل المستوى السابق أولاً لتفتح هذا الدرس.<div class="acts"><button class="btn" data-act="open" data-n="${firstUndone()}">اذهب إلى درسك</button></div></div>`;
const qb=n=>`<div class="acts"><button class="btn" data-act="quiz" data-n="${n}">📝 اختبر نفسك</button></div>`;

const V={};
V.home=()=>{const d=Object.keys(S.done).length,p=Math.round(d/7*100);
return `<section class="hero"><h1>أهلاً بك 👋</h1><p>كل خطوة صغيرة تقرّبك من القراءة. أنت تستطيع!</p><div class="bar"><i style="width:${p}%"></i></div><p>تقدّمك: <b>${p}%</b> · الدروس المكتملة: <b>${d}</b> من 7</p><button class="btn" data-act="open" data-n="${S.last}">▶ متابعة: ${LV[S.last-1]}</button></section><h2>المستويات (يمكنك إعادة أي مستوى مكتمل)</h2><div class="lv">${LV.map((x,i)=>`<button class="lvc ${S.done[i+1]?'done':''} ${lock(i+1)?'lock':''}" data-act="open" data-n="${i+1}"><b>${i+1}</b><span>${x}</span><span style="margin-right:auto">${S.done[i+1]?'✅':lock(i+1)?'🔒':'◀'}</span></button>`).join('')}</div>`};
V.letters=()=>{const t=v.tab||0,n=t+1,T=['الحروف','الأشكال','الحركات','المدود'];
let h=`<div class="tabs">${T.map((x,i)=>`<button class="tab ${i==t?'on':''}" data-act="tab" data-i="${i}">${lock(i+1)?'🔒 ':''}${x}</button>`).join('')}</div>`;
if(lock(n))return h+lk();
if(t==0)h+=`<div id="det" class="det">اضغط على أي حرف لتراه وتسمعه</div><div class="grid">${LT.map((l,i)=>`<button class="cell" data-act="let" data-i="${i}">${l.c}</button>`).join('')}</div>`;
else if(t==1)h+=`<p class="note">الحروف ا د ذ ر ز و لا تتصل بما بعدها، لذلك لها شكلان فقط.</p><div class="rows">${LT.map(l=>`<div class="row"><b>${l.c}</b>${fm(l)}</div>`).join('')}</div>`;
else if(t==2)h+=`<p class="note">الحركات الثلاث: فتحة (َ) فوق الحرف، ضمة (ُ) فوقه، كسرة (ِ) تحته. اضغط للاستماع.</p><div class="rows">${LT.map(l=>`<div class="row"><b>${l.c}</b>${HK.map(k=>`<button class="syl" data-say="${l.c+k[0]}">${l.c+k[0]}</button>`).join('')}</div>`).join('')}</div>`;
else h+=`<p class="note">المدّ: الصوت الممدود أطول من القصير. بَ (قصير) ← بَا (ممدود).</p><div class="rows">${LT.map(l=>`<div class="row"><b>${l.c}</b>${HK.map((k,i)=>`<button class="syl" data-say="${l.c+k[0]+MD[i]}">${l.c+k[0]+MD[i]}</button>`).join('')}</div>`).join('')}</div>`;
return h+qb(n)};
V.words=()=>{if(lock(5))return lk();const cs=[...new Set(WD.map(w=>w.k))];
return `<div id="det" class="det">اضغط على كلمة لتراها وتسمعها</div>`+cs.map(c=>`<h3>${c}</h3><div class="wg">${WD.map((w,i)=>w.k==c?`<button class="wc" data-act="word" data-i="${i}"><span>${w.e}</span>${w.t}</button>`:'').join('')}</div>`).join('')+qb(5)};
V.write=()=>{if(lock(6))return lk();const it=wi(wr.it),m=wr.m,sz=it.t.length<2?150:Math.min(110,Math.floor(500/it.t.length));
const opts=`<optgroup label="الحروف">${LT.map((l,i)=>`<option value="l${i}">${l.c} - ${l.n}</option>`).join('')}</optgroup><optgroup label="الأرقام">${NM.map((n,i)=>`<option value="n${i}">${i+1} - ${n}</option>`).join('')}</optgroup><optgroup label="الكلمات">${WD.map((w,i)=>`<option value="w${i}">${w.t}</option>`).join('')}</optgroup>`.replace(`value="${wr.it}"`,`value="${wr.it}" selected`);
return `<div class="tabs">${['تتبّع','انسخ','من السمع'].map((x,i)=>`<button class="tab ${i==m?'on':''}" data-act="wm" data-i="${i}">${x}</button>`).join('')}</div><select id="sel">${opts}</select>
<p class="note">${['تتبّع الخط المنقّط بإصبعك أو بالفأرة.','انظر إلى النموذج ثم اكتب في المساحة.','استمع ثم اكتب ما سمعت.'][m]} الحروف العربية تُكتب من اليمين إلى اليسار. المنصة لا تصحح الخط آلياً، قارن كتابتك بالنموذج بنفسك.</p>
${m>0?`<div class="model arabic" id="mdl" ${m==2?'hidden':''}>${it.t}</div>`:''}
<div class="pad">${m==0?`<svg viewBox="0 0 400 260"><text x="200" y="135" text-anchor="middle" dominant-baseline="middle" font-size="${sz}" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="3 6" font-family="Noto Naskh Arabic,serif">${it.t}</text></svg>`:''}<canvas id="cv"></canvas></div>
<div class="acts"><button class="btn" data-say="${it.s}">🔊 استمع</button><button class="btn2" id="clr">🧽 امسح وأعد</button>${m==2?'<button class="btn2" data-act="show">👁 أظهر النموذج</button>':''}<button class="btn" data-act="done">✔ أنهيت المحاولة</button></div><p>محاولاتك: ${S.writes} (3 محاولات تُكمل المستوى)</p>`};
V.num=()=>{if(lock(7))return lk();
return `<div id="det" class="det">اضغط على رقم لتراه وتسمعه</div><div class="grid">${NM.map((n,i)=>`<button class="cell" data-act="num" data-i="${i}">${i+1}</button>`).join('')}</div><p class="note">في الاختبار: عدّ الأشياء ثم الجمع والطرح بمسائل بسيطة.</p>${qb(7)}`};
V.ex=()=>{if(!Q)return `<h2>التمارين</h2><div class="lv">${LV.map((x,i)=>`<button class="lvc ${lock(i+1)?'lock':''}" data-act="quiz" data-n="${i+1}"><b>${i+1}</b><span>${x}</span><span style="margin-right:auto">${lock(i+1)?'🔒':i==5?'✍️':'◀'}</span></button>`).join('')}</div>`;
if(Q.fin){const ok=Q.ok>=3;return `<div class="hero"><h1>${ok?'🎉 أحسنت!':'💛 محاولة جميلة'}</h1><p>نتيجتك: ${Q.ok} من 5</p><p>${ok?(Q.n<7?'فتحتَ المستوى التالي.':'أنهيت جميع المستويات، مبارك!'):'لا بأس، التعلّم يحتاج إلى تكرار. جرّب مرة أخرى.'}</p><div class="acts"><button class="btn" data-act="quiz" data-n="${Q.n}">🔁 مرة أخرى</button><button class="btn2" data-go="home">الرئيسية</button></div></div>`}
const q=Q.L[Q.i];let h=`<p>سؤال ${Q.i+1} من 5 · المستوى ${Q.n}</p><div class="bar"><i style="width:${Q.i*20}%"></i></div><div class="card"><div class="qp">${q.p}</div>${q.s?`<div class="acts" style="justify-content:center"><button class="btn" data-say="${q.s}">🔊 استمع</button></div>`:''}`;
if(q.ord)h+=`<div class="model arabic">${Q.pk.join(' ')||'…'}</div>`;
h+=`<div class="opts">${q.o.map((o,i)=>{let c='';if(Q.ans){if(o==q.a&&!q.ord)c='ok';else if(Q.pick==i&&!q.ord)c='bad'}
const dis=Q.ans||(q.ord&&Q.used.includes(i));return `<button class="opt ${c} arabic" ${dis?'disabled':''} data-act="opt" data-i="${i}">${o}</button>`}).join('')}</div>`;
if(q.ord&&!Q.ans&&Q.pk.length)h+=`<button class="btn2" data-act="undo">↩ تراجع</button>`;
if(Q.ans)h+=`<div class="fb ${Q.ans.ok?'ok':'no'}">${Q.ans.ok?'✅ إجابة صحيحة، ممتاز!':'💛 لا بأس، حاول مرة أخرى في المرة القادمة.'}<br>${q.w}${q.ord?`<br><b class="arabic">${q.a.split('').join(' ')}</b>`:''}</div><button class="btn" data-act="next">${Q.i<4?'التالي ◀':'عرض النتيجة'}</button>`;
return h+'</div>'};
V.prog=()=>{const d=Object.keys(S.done).length,p=Math.round(d/7*100);
return `<div class="hero"><h2>تقدّمي: ${p}%</h2><div class="bar"><i style="width:${p}%"></i></div><p>الدروس المكتملة: ${d} من 7 · عدد المحاولات: ${S.attempts} · محاولات الكتابة: ${S.writes}</p></div>
<div class="lv">${LV.map((x,i)=>`<button class="lvc ${S.done[i+1]?'done':''}" data-act="open" data-n="${i+1}"><b>${i+1}</b><span>${x}</span><span style="margin-right:auto">${S.done[i+1]?'✅ مكتمل':lock(i+1)?'🔒':'قيد التعلّم'}</span></button>`).join('')}</div>
<h3>آخر النتائج</h3>${S.scores.slice(-8).reverse().map(s=>`<div class="card">المستوى ${s.n}: ${s.s} من 5 · ${s.d}</div>`).join('')||'<p>لا توجد نتائج بعد.</p>'}
<button class="btn2" data-act="reset">🗑 مسح التقدم</button>`};

const wi=k=>{const i=+k.slice(1);return k[0]=='l'?{t:LT[i].c,s:LT[i].n}:k[0]=='n'?{t:''+(i+1),s:NM[i]}:{t:WD[i].t,s:WD[i].t}};
function draw(){$('#view').innerHTML=V[v.r]();$$('nav [data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go==v.r));if(v.r=='write'&&!lock(6))initCanvas();scrollTo(0,0)}
function go(r){v={r};Q=null;draw()}
function openLevel(n){if(lock(n))return toast('أكمل المستوى السابق أولاً');S.last=n;save();Q=null;v=n<=4?{r:'letters',tab:n-1}:{r:['words','write','num'][n-5]};draw()}
function initCanvas(){const c=$('#cv');if(!c)return;const x=c.getContext('2d');c.width=c.clientWidth;c.height=c.clientHeight;x.lineWidth=10;x.lineCap=x.lineJoin='round';x.strokeStyle='#0f766e';let d=0;
const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
c.onpointerdown=e=>{d=1;c.setPointerCapture(e.pointerId);const[a,b]=p(e);x.beginPath();x.moveTo(a,b);x.lineTo(a+.1,b);x.stroke()};
c.onpointermove=e=>{if(!d)return;const[a,b]=p(e);x.lineTo(a,b);x.stroke()};
c.onpointerup=c.onpointercancel=()=>{d=0};
$('#clr').onclick=()=>x.clearRect(0,0,c.width,c.height)}

const opt3=(a,pool)=>shuf([a,...shuf(pool.filter(x=>x!=a)).slice(0,2)]);
const GEN={
1(){const l=rnd(LT),o=shuf([l,...shuf(LT.filter(x=>x!=l)).slice(0,3)]);
 return Math.random()<.5?{p:'اسمع ثم اختر الحرف الصحيح',s:l.n,o:o.map(x=>x.c),a:l.c,w:`هذا حرف ${l.n}: ${l.c}`}:{p:`ما اسم هذا الحرف؟<div class="big arabic">${l.c}</div>`,s:l.c+HK[0][0],o:o.map(x=>x.n),a:l.n,w:`الحرف ${l.c} اسمه ${l.n}`}},
2(){const l=rnd(LT.filter(x=>x.j)),p=rnd([['في بداية الكلمة',l.c+Z],['في وسط الكلمة',Z+l.c+Z],['في آخر الكلمة',Z+l.c]]);
 return{p:`أي شكل من حرف ${l.n} يُكتب ${p[0]}؟`,o:shuf([l.c+Z,Z+l.c+Z,Z+l.c,l.c]),a:p[1],w:`حرف ${l.n} ${p[0]} يُكتب هكذا: ${p[1]}`}},
3(){const l=rnd(LT),h=rnd(HK);return{p:'اسمع ثم اختر المقطع الصحيح',s:l.c+h[0],o:shuf(HK.map(k=>l.c+k[0])),a:l.c+h[0],w:`هذه ${h[1]}: ${l.c+h[0]}`}},
4(){const l=rnd(LT),k=rnd([0,1,2]),k2=(k+1)%3,sh=l.c+HK[k][0],lg=sh+MD[k],t=Math.random()<.5,s=t?sh:lg;
 return{p:'اسمع: القصير أم الممدود؟ اختر ما سمعته',s,o:shuf([sh,lg,l.c+HK[k2][0]+MD[k2],l.c+HK[k2][0]]),a:s,w:t?`${sh} صوت قصير`:`${lg} صوت ممدود، أطول من ${sh}`}},
5(){const w=rnd(WD),r=Math.random(),base=w.t.replace(/[\u064B-\u0652]/g,'');
 if(r<.35)return{p:`ما هذه الكلمة؟<div class="big">${w.e}</div>`,s:w.t,o:opt3(w.t,WD.map(x=>x.t)),a:w.t,w:`الكلمة هي ${w.t}`};
 if(r<.7||base.length<2||base.length>6)return{p:'اسمع الكلمة ثم اختر صورتها',s:w.t,o:opt3(w.e,WD.map(x=>x.e)),a:w.e,w:`${w.t} = ${w.e}`};
 return{p:`رتّب الحروف لتكوين الكلمة<div class="big">${w.e}</div>`,s:w.t,o:shuf([...base]),a:base,ord:1,w:`الكلمة: ${w.t}، مقاطعها: ${w.p.join(' · ')}`}},
7(){const r=Math.random(),mk=(a,p,w)=>{const s=new Set([a]);while(s.size<4)s.add(Math.max(0,a+(Math.random()*5|0)-2));return{p,o:shuf([...s].map(String)),a:''+a,w}};
 const n=1+Math.random()*10|0,a=1+Math.random()*8|0,b=1+Math.random()*(10-a)|0;
 if(r<.34)return mk(n,`كم عدد التفاحات؟<div class="big">${'🍎'.repeat(n)}</div>`,`عددناها فكانت ${n}`);
 if(r<.67)return mk(a+b,`معك ${a} تفاحات وأضفنا ${b}. كم أصبح عندك؟<div class="big">${'🍎'.repeat(a)} ➕ ${'🍎'.repeat(b)}</div>`,`${a} + ${b} = ${a+b}`);
 return mk(a,`كان معك ${a+b} تفاحات وأكلت ${b}. كم بقي؟<div class="big">${'🍎'.repeat(a+b)} ➖ ${b}</div>`,`${a+b} − ${b} = ${a}`)}};
function startQuiz(n){if(lock(n))return toast('أكمل المستوى السابق أولاً');if(n==6){v={r:'write'};Q=null;return draw()}
 Q={n,i:0,ok:0,L:Array.from({length:5},()=>GEN[n]()),pk:[],used:[]};v={r:'ex'};draw()}
function finishAns(ok,pick){Q.ans={ok};Q.pick=pick;if(ok)Q.ok++;S.attempts++;save();draw()}

const A={
open:(i,n)=>openLevel(n),tab:i=>{v.tab=i;draw()},quiz:(i,n)=>startQuiz(n),
let:i=>{const l=LT[i];$('#det').innerHTML=`<div class="big arabic">${l.c}</div><h3>${l.n}</h3><p class="note">الاسم: ${l.n} · الصوت: ${l.c+HK[0][0]}</p><div class="acts"><button class="btn" data-say="${l.n}">🔊 اسم الحرف</button><button class="btn2" data-say="${l.c+HK[0][0]}">🔊 صوت الحرف</button></div><p>${l.e} <b>${l.w}</b> ${spk(l.w)}</p><div class="forms">${fm(l)}</div>`;say(l.n)},
word:i=>{const w=WD[i];$('#det').innerHTML=`<div class="big">${w.e}</div><div class="big arabic" style="font-size:3.5rem">${w.t}</div><div class="acts" style="justify-content:center"><button class="btn" data-say="${w.t}">🔊 استمع</button></div><p>المقاطع: ${w.p.map(s=>`<button class="syl" data-say="${s}">${s}</button>`).join('·')}</p><div class="acts"><button class="btn2" data-act="wr" data-i="${i}">✍️ اكتبها</button></div>`;say(w.t)},
num:i=>{$('#det').innerHTML=`<div class="big">${i+1}</div><h3>${NM[i]}</h3><div class="qp">${'🍎'.repeat(i+1)}</div><div class="acts"><button class="btn" data-say="${NM[i]}">🔊 استمع</button><button class="btn2" data-act="wrn" data-i="${i}">✍️ اكتبه</button></div>`;say(NM[i])},
wr:i=>{wr={it:'w'+i,m:1};v={r:'write'};draw()},wrn:i=>{wr={it:'n'+i,m:0};v={r:'write'};draw()},
wm:i=>{wr.m=i;draw()},show:()=>{const m=$('#mdl');if(m)m.hidden=!m.hidden},
done:()=>{S.writes++;S.attempts++;if(S.writes>=3&&!S.done[6]){S.done[6]=1;S.last=7;toast('🎉 أكملت مستوى الكتابة!')}else toast('أحسنت! استمر 👏');save();draw()},
opt:i=>{if(!Q||Q.ans)return;const q=Q.L[Q.i];
 if(q.ord){if(Q.used.includes(i))return;Q.used.push(i);Q.pk.push(q.o[i]);if(Q.pk.length<q.o.length)return draw();return finishAns(Q.pk.join('')==q.a,i)}
 finishAns(q.o[i]==q.a,i)},
undo:()=>{Q.pk.pop();Q.used.pop();draw()},
next:()=>{if(Q.i<4){Q.i++;Q.ans=null;Q.pk=[];Q.used=[];return draw()}
 Q.fin=1;S.scores.push({n:Q.n,s:Q.ok,d:new Date().toLocaleDateString('ar')});if(Q.ok>=3){S.done[Q.n]=1;S.last=Math.min(7,Q.n+1)}save();draw()},
reset:()=>{if(confirm('هل تريد مسح كل تقدمك؟')){S={done:{},scores:[],attempts:0,writes:0,last:1};save();go('home')}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-say],[data-go],[data-act]');if(!b)return;const d=b.dataset;
 if(d.say)say(d.say);if(d.go)go(d.go);if(d.act&&A[d.act])A[d.act](+d.i,+d.n,b)});
document.addEventListener('change',e=>{if(e.target.id=='sel'){wr.it=e.target.value;draw()}});
if('speechSynthesis' in window)speechSynthesis.getVoices();
draw();
