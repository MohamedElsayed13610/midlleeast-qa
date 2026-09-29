const people=[
['08','نهى محمود','محامية','قطر','محامية منتسبة إلى نقابة المحامين في بيروت، متخصصة في القانون التجاري القطري والتقاضي والضرائب. تحمل ماجستير في القانون الخاص وخبرة في البحث الضريبي المقارن، وتتقن العربية والفرنسية والإنجليزية.'],
['09','خالد عبد الوهاب','مساعد قانوني','قطر','يدعم فريق المحامين في إعداد القضايا وإجراء البحوث القانونية ومراجعة المستندات، مع اهتمام بالتفاصيل وتنظيم مسارات العمل داخل الملفات.'],
['10','زاهر غريزي','محامٍ دولي','إقليمي','محامٍ دولي بخبرة تتجاوز تسع سنوات في المملكة المتحدة وقطر والإمارات والسعودية ولبنان. خريج جامعة الحكمة وعضو في نقابة المحامين في بيروت.'],
['11','ليندا غريزي','شريكة — محامية','لبنان','حاصلة على بكالوريوس وماجستير في القانون من جامعة الحكمة، ومسجلة في نقابة المحامين. تشارك في إدارة الملفات وتقديم المشورة القانونية للعملاء.'],
['12','دينا علي أبو زور','شريكة — محامية','لبنان','محامية بخبرة تزيد على 12 عامًا في القانون المالي والعقاري. تشارك في مبادرات إصلاحية وحقوقية، وتقدم استشارات قانونية وتدرّس في جامعة الحكمة.'],
['13','إلسا بو حيدر','محامية','لبنان','محامية أولى بخبرة تتجاوز عشر سنوات، متخصصة في القانونين التجاري والمدني. خريجة الجامعة اللبنانية وعضو في نقابة المحامين في بيروت.'],
['14','دولسا إيلي الخراط','محامية','لبنان','محامية بخبرة تتجاوز 12 عامًا في الملفات الجنائية والمدنية والعقارية في لبنان وقطر، وخريجة الجامعة اللبنانية وعضو في نقابة المحامين في بيروت.'],
['15','حسام الحكيم','شريك — محامٍ','لبنان','محامٍ بخبرة تتجاوز 12 عامًا في القوانين العقارية والتجارية والمدنية والجنائية. يحمل ماجستير في القانون العام، وله مساهمات في الإصلاحات التشريعية والمؤتمرات القانونية.'],
['16','فيفيان مراد','محامية','لبنان','حاصلة على بكالوريوس وماجستير في القانون من جامعة الحكمة، وتعمل ضمن الفريق القانوني في متابعة الملفات وإعداد الدراسات والمذكرات.'],
['17','بهاء الدين البشير','محامٍ','قطر','محامٍ ضمن فريق المكتب، يشارك في متابعة الملفات القانونية وإعداد الأعمال اللازمة لخدمة القضايا والاستشارات.'],
['18','لين زبيان','محامية مبتدئة','لبنان','تحمل ماجستير من الجامعة اللبنانية وعضو في نقابة المحامين في بيروت. اكتسبت خبرة في إدارة القضايا والعمل الإصلاحي والتعاون القانوني مع مكاتب في قطر.'],
['19','ميرا عبد الخالق','محامية مبتدئة','لبنان','حاصلة على بكالوريوس في القانون من الجامعة اللبنانية وتتابع دراسات عليا في المنظمات الدولية. مسجلة في نقابة المحامين وتعمل على تمثيل العملاء ومتابعة ملفاتهم.'],
['20','ياسمين نصر','باحثة قانونية','لبنان','تحمل ماجستير في التمويل وتتابع دراسة القانون، مع خبرة تتجاوز سبع سنوات في الإدارة والبحث القانوني وإعداد المستندات ودعم المحاكمات في عدة أسواق عربية.'],
['21','إيمان عبد العزيز','محامية','مصر','محامية في مكتب مصر، تتابع الملفات القانونية المحلية وتدعم أعمال التقاضي والاستشارات الخاصة بعملاء الفرع.'],
['22','أبو بكر عثمان','مسؤول علاقات عامة','قطر','يتولى دعم العلاقات العامة والتنسيق المؤسسي، ويساهم في تسهيل التواصل والمتابعة بين المكتب وعملائه والجهات ذات الصلة.'],
['23','عبد الحميد الشربيني','مسؤول علاقات عامة','قطر','يعمل في العلاقات العامة والتنسيق الإداري، ويدعم التواصل المنظم ومتابعة الإجراءات المرتبطة بأعمال المكتب.'],
['24','محمد عصام قبّاوة','محامٍ','قطر','محامٍ ضمن فريق المكتب، يشارك في إعداد ومتابعة الملفات القانونية وأعمال التقاضي والاستشارات.'],
['25','محمود عبد العزيز','محامٍ','مصر','محامٍ في مكتب مصر، يساهم في متابعة القضايا وتقديم الدعم القانوني للعملاء وفق متطلبات النظام القانوني المحلي.'],
['26','محمد عرفات','محامٍ','قطر','محامٍ بخبرة تتجاوز عشر سنوات في القضايا المدنية والتجارية والجنائية والعمالية في قطر، ومتمكن من الأنظمة الإلكترونية للمحاكم القطرية والنيابة العامة.']
];
const network=document.getElementById('teamNetwork');
people.forEach(p=>{const btn=document.createElement('button');btn.className='network-card reveal';const n=Number(p[0]);btn.innerHTML='<div class="network-photo portrait" data-portrait="'+n+'"></div><div class="network-info"><div class="top"><span>'+p[0]+'</span><span>'+p[3]+'</span></div><h3>'+p[1]+'</h3><p class="network-role">'+p[2]+'</p></div><div class="network-bio"><span>نبذة الخبرة</span><h3>'+p[1]+'</h3><p>'+p[4]+'</p></div>';btn.addEventListener('click',()=>openModal(p));network.appendChild(btn)});
const modal=document.getElementById('personModal');
function openModal(p){document.getElementById('modalIndex').textContent=p[0];document.getElementById('modalCountry').textContent=p[3];document.getElementById('modalName').textContent=p[1];document.getElementById('modalRole').textContent=p[2];document.getElementById('modalBio').textContent=p[4];modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
modal.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',closeModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
const header=document.querySelector('.site-header');const nav=document.querySelector('.main-nav');const menu=document.querySelector('.menu-btn');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>40),{passive:true});
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

async function loadTeamPortraits(){
  const files=[1,2,3,4,5,6].map(n=>'assets/team-sprite.part'+n+'.txt');
  const parts=await Promise.all(files.map(async path=>{
    const res=await fetch(path);
    if(!res.ok) throw new Error('Failed to load '+path);
    return (await res.text()).trim();
  }));
  const sprite=new Image();
  sprite.src='data:image/webp;base64,'+parts.join('');
  await sprite.decode();
  document.querySelectorAll('[data-portrait]').forEach(el=>{
    const portrait=Math.max(1,Math.min(26,Number(el.dataset.portrait)||1))-1;
    const sx=(portrait%5)*150;
    const sy=Math.floor(portrait/5)*190;
    const canvas=document.createElement('canvas');
    canvas.width=150;
    canvas.height=190;
    const ctx=canvas.getContext('2d');
    ctx.drawImage(sprite,sx,sy,150,190,0,0,150,190);
    const img=document.createElement('img');
    img.src=canvas.toDataURL('image/webp',0.9);
    img.alt='';
    img.loading=portrait<7?'eager':'lazy';
    img.decoding='async';
    el.replaceChildren(img);
  });
}
loadTeamPortraits().catch(err=>console.warn('Team portraits:',err));