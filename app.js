'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rnd=a=>a[Math.random()*a.length|0],shuf=a=>[...a].sort(()=>Math.random()-.5);
const Z='\u200D',HK=[['\u064E','الفتحة'],['\u064F','الضمة'],['\u0650','الكسرة']],MD=['ا','و','ي'];
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

const TILES=[['letters','t1','🔤','الحروف','28 حرفاً بأشكالها وحركاتها'],['words','t2','🖼️','الكلمات','كلمات بالصورة والنطق'],['write','t3','✍️','الكتابة','تتبّع واكتب بإصبعك'],['num','t4','🔢','الأرقام','من 1 إلى 10 بالصور'],['calc','t5','➕','الحساب','جمع وطرح سهل'],['ex','t6','🎯','تمارين','اختبر نفسك كما تشاء']];
const TYPES=[['hear','اسمع واختر الحرف','🔊'],['name','ما اسم الحرف؟','🔤'],['forms','شكل الحرف في الكلمة','🧩'],['haraka','الحركات','َ'],['madd','القصير والممدود','↔️'],['pic','الكلمة والصورة','🖼️'],['order','رتّب الحروف','🔀'],['count','عدّ الأشياء','🍎'],['add','الجمع','➕'],['sub','الطرح','➖']];

let S={seen:{l:{},w:{},n:{}},best:{},attempts:0,writes:0},v={r:'home',tab:0,cat:''},Q=null,wr={it:'l0',m:0};
try{S=Object.assign(S,JSON.parse(localStorage.getItem('t3alam2')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('t3alam2',JSON.stringify(S))}catch(e){}};
const see=(k,i)=>{S.seen[k][i]=1;save()};
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2800)};

/* الصوت: ملف mp3 من مجلد audio إن وُجد، وإلا أفضل صوت عربي في الجهاز */
let warned=0,cur=null,voice=null;const noAudio=new Set();
const sc=x=>(/natural|neural|online|google/i.test(x.name)?10:0)+(/ar-?(sa|eg)/i.test(x.lang)?2:0);
function pickVoice(){const vs=(window.speechSynthesis?speechSynthesis.getVoices():[]).filter(x=>x.lang&&x.lang.toLowerCase().startsWith('ar'));voice=vs.sort((a,b)=>sc(b)-sc(a))[0]||null}
function tts(t){try{const s=window.speechSynthesis;if(!s)throw 0;s.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=voice?voice.lang:'ar-SA';u.rate=.85;if(voice)u.voice=voice;else if(!warned++)toast('لا يوجد صوت عربي جيد على جهازك. جرّب Chrome أو Edge.');s.speak(u)}catch(e){toast('الصوت غير متوفر على هذا الجهاز')}}
function say(t){if(cur){cur.pause();cur=null}if(noAudio.has(t))return tts(t);const a=new Audio('audio/'+encodeURIComponent(t)+'.mp3');cur=a;a.onerror=()=>{noAudio.add(t);tts(t)};a.play().catch(()=>{})}

const spk=t=>`<button class="spk" data-say="${t}" aria-label="استمع">🔊</button>`;
const F=l=>l.j?[['منفصل',l.c],['بداية',l.c+Z],['وسط',Z+l.c+Z],['نهاية',Z+l.c]]:[['منفصل',l.c],['نهاية',Z+l.c]];
const fm=l=>F(l).map(f=>`<span class="f"><small>${f[0]}</small>${f[1]}</span>`).join('');
const stars=s=>s>=5?'★★★':s>=3?'★★☆':s>=1?'★☆☆':'☆☆☆';
const rowsH=(m)=>`<div class="rows">${LT.map(l=>`<div class="row"><b>${l.c}</b>${HK.map((k,i)=>{const s=l.c+k[0]+(m?MD[i]:'');return `<button class="syl" data-say="${s}">${s}</button>`}).join('')}</div>`).join('')}</div>`;
const qb=(t,f)=>'';

const V={};
V.home=()=>{const c=k=>Object.keys(S.seen[k]).length;
return `<section class="hero"><h1>مرحباً بك 👋</h1><p>اختر ما تحب أن تتعلمه اليوم. كل شيء مفتوح، وأنت من يقرر.</p></section>
<h2>ماذا تريد أن تتعلم؟</h2>
<div class="tiles">${TILES.map(t=>`<button class="tile ${t[1]}" data-go="${t[0]=='calc'?'num':t[0]}" ${t[0]=='calc'?'data-tab="1"':''}><span>${t[2]}</span><b>${t[3]}</b><small>${t[4]}</small></button>`).join('')}</div>
<div class="stats"><div><b>${c('l')}/28</b><small>حرفاً تعلّمته</small></div><div><b>${c('w')}/${WD.length}</b><small>كلمة</small></div><div><b>${c('n')}/10</b><small>أرقام</small></div></div>`};

V.letters=()=>{const t=v.tab||0;
return `<div class="tabs">${['الحروف','الحركات','المدود'].map((x,i)=>`<button class="tab ${i==t?'on':''}" data-act="tab" data-i="${i}">${x}</button>`).join('')}</div>`+
(t==0?`<p class="hint">اضغط على أي حرف لتتعلمه</p><div class="grid">${LT.map((l,i)=>`<button class="cell ${S.seen.l[i]?'seen':''}" data-act="let" data-i="${i}">${l.c}</button>`).join('')}</div>`
:`<p class="note">${t==1?'الفتحة فوق الحرف، والضمة فوقه، والكسرة تحته. اضغط للاستماع.':'المدّ: الصوت الممدود أطول من القصير. بَ (قصير) ← بَا (ممدود).'}</p>${rowsH(t==2)}`)};

V.letter=()=>{const i=v.i,l=LT[i];
return `<div class="top"><button class="back" data-go="letters">→ كل الحروف</button><span>${i+1} / 28</span></div>
<div class="card showc"><div class="big arabic">${l.c}</div><h2>${l.n}</h2><div class="acts c"><button class="btn" data-say="${l.n}">🔊 اسم الحرف</button><button class="btn2" data-say="${l.c+HK[0][0]}">🔊 صوته</button></div><p class="note">اسم الحرف «${l.n}»، وصوته «${l.c+HK[0][0]}». الاسم غير الصوت.</p></div>
<div class="card"><h3>مثال</h3><div class="ex"><span>${l.e}</span><b class="arabic">${l.w}</b>${spk(l.w)}</div></div>
<div class="card"><h3>شكله حسب موقعه في الكلمة</h3><div class="forms">${fm(l)}</div></div>
<div class="card"><h3>الحركات والمدود</h3><div class="rows">${HK.map((k,j)=>`<div class="row"><button class="syl" data-say="${l.c+k[0]}">${l.c+k[0]}</button>${spk(l.c+k[0])}<button class="syl" data-say="${l.c+k[0]+MD[j]}">${l.c+k[0]+MD[j]}</button>${spk(l.c+k[0]+MD[j])}<small>${k[1]}</small></div>`).join('')}</div></div>
<div class="acts"><button class="btn" data-act="trace" data-i="${i}">✍️ تتبّع الحرف</button><button class="btn2" data-act="lq" data-i="${i}">🎯 تمرّن عليه</button></div>
<div class="pn"><button class="btn2" data-act="let" data-i="${(i+27)%28}">▶ السابق</button><button class="btn2" data-act="let" data-i="${(i+1)%28}">التالي ◀</button></div>`};

V.words=()=>{const cs=[...new Set(WD.map(w=>w.k))];
return `<div class="chips"><button class="chip ${!v.cat?'on':''}" data-act="cat" data-c="">الكل</button>${cs.map(c=>`<button class="chip ${v.cat==c?'on':''}" data-act="cat" data-c="${c}">${c}</button>`).join('')}</div><div class="wg">${WD.map((w,i)=>!v.cat||w.k==v.cat?`<button class="wc ${S.seen.w[i]?'seen':''}" data-act="word" data-i="${i}"><span>${w.e}</span>${w.t}</button>`:'').join('')}</div>`};

V.word=()=>{const i=v.i,w=WD[i];
return `<div class="top"><button class="back" data-go="words">→ كل الكلمات</button><span>${w.k}</span></div>
<div class="card showc"><div class="big">${w.e}</div><div class="big arabic" style="font-size:4rem">${w.t}</div><div class="acts c"><button class="btn" data-say="${w.t}">🔊 استمع</button></div></div>
<div class="card"><h3>المقاطع</h3><p style="text-align:center">${w.p.map(s=>`<button class="syl" data-say="${s}">${s}</button>`).join(' · ')}</p></div>
<div class="acts"><button class="btn" data-act="wtrace" data-i="${i}">✍️ اكتب الكلمة</button><button class="btn2" data-act="wq" data-i="${i}">🎯 تمرّن عليها</button></div>
<div class="pn"><button class="btn2" data-act="word" data-i="${(i+WD.length-1)%WD.length}">▶ السابقة</button><button class="btn2" data-act="word" data-i="${(i+1)%WD.length}">التالية ◀</button></div>`};

const wi=k=>{const i=+k.slice(1);return k[0]=='l'?{t:LT[i].c,s:LT[i].n}:k[0]=='n'?{t:''+(i+1),s:NM[i]}:{t:WD[i].t,s:WD[i].t}};
V.write=()=>{const it=wi(wr.it),m=wr.m,sz=it.t.length<2?150:Math.min(110,Math.floor(500/it.t.length));
const opts=`<optgroup label="الحروف">${LT.map((l,i)=>`<option value="l${i}">${l.c} - ${l.n}</option>`).join('')}</optgroup><optgroup label="الأرقام">${NM.map((n,i)=>`<option value="n${i}">${i+1} - ${n}</option>`).join('')}</optgroup><optgroup label="الكلمات">${WD.map((w,i)=>`<option value="w${i}">${w.t}</option>`).join('')}</optgroup>`.replace(`value="${wr.it}"`,`value="${wr.it}" selected`);
return `<div class="tabs">${['تتبّع','انسخ','من السمع'].map((x,i)=>`<button class="tab ${i==m?'on':''}" data-act="wm" data-i="${i}">${x}</button>`).join('')}</div><select id="sel">${opts}</select>
<p class="note">${['تتبّع الخط المنقّط بإصبعك أو بالفأرة.','انظر إلى النموذج ثم اكتب في المساحة.','استمع ثم اكتب ما سمعت.'][m]} تُكتب العربية من اليمين إلى اليسار. المنصة لا تصحح الخط آلياً، قارن كتابتك بالنموذج.</p>
${m>0?`<div class="model" id="mdl" ${m==2?'hidden':''}>${it.t}</div>`:''}
<div class="pad">${m==0?`<svg viewBox="0 0 400 260"><text x="200" y="135" text-anchor="middle" dominant-baseline="middle" font-size="${sz}" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="3 6" font-family="Amiri,serif">${it.t}</text></svg>`:''}<canvas id="cv"></canvas></div>
<div class="acts"><button class="btn" data-say="${it.s}">🔊 استمع</button><button class="btn2" id="clr">🧽 امسح</button>${m==2?'<button class="btn2" data-act="show">👁 النموذج</button>':''}<button class="btn" data-act="done">✔ أنهيت</button></div><p class="hint">محاولاتك: ${S.writes}</p>`};

V.num=()=>{const t=v.tab||0;
return `<div class="tabs">${['الأرقام','الجمع والطرح'].map((x,i)=>`<button class="tab ${i==t?'on':''}" data-act="tab" data-i="${i}">${x}</button>`).join('')}</div>`+
(t==0?`<div id="det" class="card showc">اضغط على رقم لتراه وتسمعه</div><div class="grid">${NM.map((n,i)=>`<button class="cell ${S.seen.n[i]?'seen':''}" data-act="numd" data-i="${i}">${i+1}</button>`).join('')}</div><div class="acts"><button class="btn2" data-act="quiz" data-t="count">🍎 تمرّن على العدّ</button></div>`
:`<div class="card showc"><div class="qp">🍎🍎 ➕ 🍎 = ؟</div><div class="big" style="font-size:3.5rem">🍎🍎🍎</div><p>2 + 1 = 3</p></div><div class="acts c"><button class="btn" data-act="quiz" data-t="add">➕ تمارين الجمع</button><button class="btn2" data-act="quiz" data-t="sub">➖ تمارين الطرح</button></div>`)};

V.ex=()=>{if(!Q)return `<h2>اختر التمرين الذي تريده</h2><div class="lv">${TYPES.map(t=>`<button class="xt" data-act="quiz" data-t="${t[0]}"><span>${t[2]}</span>${t[1]}<br><small>${stars(S.best[t[0]]||0)}</small></button>`).join('')}</div>`;
if(Q.fin)return `<div class="card showc"><h1>${Q.ok>=3?'🎉 أحسنت!':'💛 محاولة جميلة'}</h1><div class="qp">${Q.ok} من 5 · ${stars(Q.ok)}</div><p>${Q.ok>=3?'نتيجة رائعة!':'لا بأس، التكرار يصنع الإتقان.'}</p><div class="acts c"><button class="btn" data-act="again">🔁 مرة أخرى</button><button class="btn2" data-go="ex">تمارين أخرى</button></div></div>`;
const q=Q.L[Q.i];
let h=`<p class="hint">سؤال ${Q.i+1} من 5</p><div class="bar"><i style="width:${Q.i*20}%"></i></div><div class="card"><div class="qp">${q.p}</div>${q.s?`<div class="acts c"><button class="btn" data-say="${q.s}">🔊 استمع</button></div>`:''}`;
if(q.ord)h+=`<div class="model">${Q.pk.join(' ')||'…'}</div>`;
h+=`<div class="opts">${q.o.map((o,i)=>{let c='';if(Q.ans&&!q.ord){if(o==q.a)c='ok';else if(Q.pick==i)c='bad'}
const d=Q.ans||(q.ord&&Q.used.includes(i));return `<button class="opt ${c}" ${d?'disabled':''} data-act="opt" data-i="${i}">${o}</button>`}).join('')}</div>`;
if(q.ord&&!Q.ans&&Q.pk.length)h+=`<button class="btn2" data-act="undo">↩ تراجع</button>`;
if(Q.ans)h+=`<div class="fb ${Q.ans.ok?'ok':'no'}">${Q.ans.ok?'✅ إجابة صحيحة، ممتاز!':'💛 لا بأس، جرّب مرة أخرى.'}<br>${q.w}</div><button class="btn" data-act="next">${Q.i<4?'التالي ◀':'النتيجة'}</button>`;
return h+'</div>'};

V.prog=()=>{const c=k=>Object.keys(S.seen[k]).length;
return `<h2>تقدّمي</h2><div class="stats"><div><b>${c('l')}/28</b><small>حروف</small></div><div><b>${c('w')}/${WD.length}</b><small>كلمات</small></div><div><b>${c('n')}/10</b><small>أرقام</small></div><div><b>${S.attempts}</b><small>إجابات</small></div><div><b>${S.writes}</b><small>محاولات كتابة</small></div></div>
<h3>نجوم التمارين</h3><div class="lv">${TYPES.map(t=>`<div class="xt"><span>${t[2]}</span>${t[1]}<br><small>${stars(S.best[t[0]]||0)}</small></div>`).join('')}</div>
<div class="acts"><button class="btn2" data-act="reset">🗑 مسح التقدم</button></div>`};

const NK={letter:'letters',word:'words',prog:''};
function draw(){$('#view').innerHTML=V[v.r]();const k=v.r in NK?NK[v.r]:v.r;$$('.bn [data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go==k));if($('#cv'))initCanvas();scrollTo(0,0)}
function go(r,t=0){v={r,tab:t,cat:''};Q=null;draw()}
function initCanvas(){const c=$('#cv'),x=c.getContext('2d');c.width=c.clientWidth;c.height=c.clientHeight;x.lineWidth=10;x.lineCap=x.lineJoin='round';x.strokeStyle='#0e7c66';let d=0;
const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
c.onpointerdown=e=>{d=1;c.setPointerCapture(e.pointerId);const[a,b]=p(e);x.beginPath();x.moveTo(a,b);x.lineTo(a+.1,b);x.stroke()};
c.onpointermove=e=>{if(!d)return;const[a,b]=p(e);x.lineTo(a,b);x.stroke()};
c.onpointerup=c.onpointercancel=()=>{d=0};
$('#clr').onclick=()=>x.clearRect(0,0,c.width,c.height)}

/* الأسئلة */
const opts=(a,pool,n=4)=>shuf([a,...shuf(pool.filter(x=>x!=a)).slice(0,n-1)]);
const pl=f=>f&&f.l!=null?LT[f.l]:rnd(LT),pw=f=>f&&f.w!=null?WD[f.w]:rnd(WD);
const numQ=(a,p,w)=>{const s=new Set([a]);while(s.size<4)s.add(Math.max(0,a+(Math.random()*5|0)-2));return{p,o:shuf([...s].map(String)),a:''+a,w}};
const GEN={
hear:f=>{const l=pl(f);return{p:'اسمع ثم اختر الحرف',s:l.n,o:opts(l.c,LT.map(x=>x.c)),a:l.c,w:`هذا حرف ${l.n}: ${l.c}`}},
name:f=>{const l=pl(f);return{p:`ما اسم هذا الحرف؟<div class="big arabic">${l.c}</div>`,s:l.c+HK[0][0],o:opts(l.n,LT.map(x=>x.n)),a:l.n,w:`الحرف ${l.c} اسمه ${l.n}`}},
forms:f=>{const l=pl(f);if(!l.j)return GEN.haraka(f);const p=rnd([['في بداية الكلمة',l.c+Z],['في وسط الكلمة',Z+l.c+Z],['في آخر الكلمة',Z+l.c]]);
 return{p:`أي شكل من حرف ${l.n} يُكتب ${p[0]}؟`,o:shuf([l.c+Z,Z+l.c+Z,Z+l.c,l.c]),a:p[1],w:`حرف ${l.n} ${p[0]} يُكتب: ${p[1]}`}},
haraka:f=>{const l=pl(f),h=rnd(HK);return{p:'اسمع ثم اختر المقطع الصحيح',s:l.c+h[0],o:shuf(HK.map(k=>l.c+k[0])).concat(l.c).slice(0,4),a:l.c+h[0],w:`هذه ${h[1]}: ${l.c+h[0]}`}},
madd:f=>{const l=pl(f),k=rnd([0,1,2]),k2=(k+1)%3,sh=l.c+HK[k][0],lg=sh+MD[k],t=Math.random()<.5,s=t?sh:lg;
 return{p:'اسمع: قصير أم ممدود؟ اختر ما سمعته',s,o:shuf([sh,lg,l.c+HK[k2][0]+MD[k2],l.c+HK[k2][0]]),a:s,w:t?`${sh} صوت قصير`:`${lg} صوت ممدود، أطول من ${sh}`}},
pic:f=>{const w=pw(f);return Math.random()<.5?{p:`ما هذه الكلمة؟<div class="big">${w.e}</div>`,s:w.t,o:opts(w.t,WD.map(x=>x.t)),a:w.t,w:`الكلمة هي ${w.t}`}:{p:'اسمع الكلمة ثم اختر صورتها',s:w.t,o:opts(w.e,WD.map(x=>x.e)),a:w.e,w:`${w.t} = ${w.e}`}},
order:f=>{const w=pw(f),b=w.t.replace(/[\u064B-\u0652]/g,'');if(b.length<2||b.length>6)return GEN.pic(f);
 return{p:`رتّب الحروف لتكوين الكلمة<div class="big">${w.e}</div>`,s:w.t,o:shuf([...b]),a:b,ord:1,w:`الكلمة: ${w.t}، مقاطعها: ${w.p.join(' · ')}`}},
count:()=>{const n=1+Math.random()*10|0;return numQ(n,`كم عدد التفاحات؟<div class="big">${'🍎'.repeat(n)}</div>`,`عددناها فكانت ${n}`)},
add:()=>{const a=1+Math.random()*8|0,b=1+Math.random()*(10-a)|0;return numQ(a+b,`معك ${a} وأضفنا ${b}. كم أصبح عندك؟<div class="big">${'🍎'.repeat(a)} ➕ ${'🍎'.repeat(b)}</div>`,`${a} + ${b} = ${a+b}`)},
sub:()=>{const a=1+Math.random()*8|0,b=1+Math.random()*(10-a)|0;return numQ(a,`كان معك ${a+b} وأكلت ${b}. كم بقي؟<div class="big">${'🍎'.repeat(a+b)} ➖ ${b}</div>`,`${a+b} − ${b} = ${a}`)}};
function startQuiz(t,f){const g=()=>GEN[t=='mix'?rnd(['hear','name','forms','haraka','madd']):t=='wq'?rnd(['pic','order']):t](f);
 Q={t,f,i:0,ok:0,L:Array.from({length:5},g),pk:[],used:[]};v={r:'ex'};draw()}
function ans(ok,pick){Q.ans={ok};Q.pick=pick;if(ok)Q.ok++;S.attempts++;save();draw()}

const A={
tab:i=>{v.tab=i;draw()},cat:(i,n,b)=>{v.cat=b.dataset.c;draw()},
let:i=>{v={r:'letter',i};see('l',i);draw();say(LT[i].n)},
word:i=>{v={r:'word',i};see('w',i);draw();say(WD[i].t)},
numd:i=>{see('n',i);$('#det').innerHTML=`<div class="big">${i+1}</div><h2>${NM[i]}</h2><div class="qp">${'🍎'.repeat(i+1)}</div><div class="acts c"><button class="btn" data-say="${NM[i]}">🔊 استمع</button><button class="btn2" data-act="wn" data-i="${i}">✍️ اكتبه</button></div>`;say(NM[i]);$$('.cell')[i].classList.add('seen')},
trace:i=>{wr={it:'l'+i,m:0};v={r:'write'};draw()},wtrace:i=>{wr={it:'w'+i,m:1};v={r:'write'};draw()},wn:i=>{wr={it:'n'+i,m:0};v={r:'write'};draw()},
wm:i=>{wr.m=i;draw()},show:()=>{const m=$('#mdl');if(m)m.hidden=!m.hidden},
done:()=>{S.writes++;save();toast('أحسنت! استمر 👏');draw()},
quiz:(i,n,b)=>startQuiz(b.dataset.t),lq:i=>startQuiz('mix',{l:i}),wq:i=>startQuiz('wq',{w:i}),again:()=>startQuiz(Q.t,Q.f),
opt:i=>{if(!Q||Q.ans)return;const q=Q.L[Q.i];
 if(q.ord){if(Q.used.includes(i))return;Q.used.push(i);Q.pk.push(q.o[i]);if(Q.pk.length<q.o.length)return draw();return ans(Q.pk.join('')==q.a,i)}
 ans(q.o[i]==q.a,i)},
undo:()=>{Q.pk.pop();Q.used.pop();draw()},
next:()=>{if(Q.i<4){Q.i++;Q.ans=null;Q.pk=[];Q.used=[];return draw()}
 Q.fin=1;if(TYPES.some(t=>t[0]==Q.t))S.best[Q.t]=Math.max(S.best[Q.t]||0,Q.ok);save();draw()},
reset:()=>{if(confirm('هل تريد مسح كل التقدم؟')){S={seen:{l:{},w:{},n:{}},best:{},attempts:0,writes:0};save();go('home')}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-say],[data-go],[data-act]');if(!b)return;const d=b.dataset;
 if(d.say)say(d.say);if(d.go)go(d.go,+d.tab||0);if(d.act&&A[d.act])A[d.act](+d.i,+d.n,b)});
document.addEventListener('change',e=>{if(e.target.id=='sel'){wr.it=e.target.value;draw()}});
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
draw();
