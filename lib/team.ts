import { imageDimensions } from "@/lib/image-dimensions";

export const featuredPeople = [
  { name: "محمد بن عوجان الهاجري", role: "محامٍ أمام محكمة التمييز", office: "قطر", image: "/assets/team/mohamed-bin-aujan-cutout.webp", bio: "محامٍ مؤهل للمثول أمام محكمة التمييز، يحمل بكالوريوس القانون من جامعة بيروت العربية. جمع بين خبرة طويلة في التحقيق والشؤون القانونية بوزارة الداخلية وممارسة المحاماة، مع تدريب متخصص في مكافحة غسل الأموال والاتجار بالبشر." },
  { name: "صقر محمد صقر", role: "المدير التنفيذي — شريك", office: "قطر", image: "/assets/team/saqr-cutout.webp", bio: "يقود العمليات والتوجه الاستراتيجي للمكتب، مستندًا إلى خبرة في القانون الإداري وحوكمة الشركات وبناء أنظمة عمل تحافظ على جودة الخدمة القانونية." },
  { name: "أحمد الحوت", role: "محامٍ — شريك", office: "قطر", image: "/assets/team/ahmed-elhout-cutout.webp", bio: "متخصص في القانون التجاري ومعاملات الشركات، ويتمتع بخبرة قانونية تتجاوز عشر سنوات، مع تركيز على بناء حلول عملية للمسائل التجارية المعقدة." },
  { name: "حنّا الناشف", role: "محامٍ أمام الاستئناف والتمييز", office: "قطر", image: "/assets/team/cutouts/hanna.webp", bio: "محامٍ مؤهل أمام محكمتي الاستئناف والتمييز، تخرج في الجامعة اللبنانية عام 1966. كان من رواد مهنة المحاماة في قطر منذ السبعينيات، كما عمل خبيرًا قانونيًا لدى مصرف قطر المركزي وله أبحاث في القانون المدني." },
  { name: "رفيق غريزي", role: "شريك — محامٍ", office: "لبنان", image: "/assets/team/cutouts/rafiq.webp", bio: "خريج جامعة الحكمة وعضو في نقابة المحامين منذ 2011. يركز في عمله على التحكيم والأعمال التشريعية والملفات العابرة للحدود." },
  { name: "السيد معتوق", role: "مستشار قانوني أول", office: "قطر", image: "/assets/team/cutouts/elsayed.webp", bio: "مستشار قانوني أول يركز على الملكية الفكرية والتقاضي التجاري، ويعمل على حماية مصالح العملاء وصياغة استراتيجيات واضحة للملفات القانونية المركبة." },
  { name: "عمر صقر", role: "رئيس الشراكات وتطوير الأعمال", office: "قطر", image: "/assets/team/cutouts/omar.webp", bio: "يقود تطوير الشراكات وبناء التحالفات الاستراتيجية وتوسيع شبكة المكتب، ويربط بين فرص النمو واحتياجات العملاء في الأسواق المختلفة." },
];

export const team = [
  { name: "نهى محمود", role: "محامية", office: "قطر", image: "/assets/team/cutouts/noha.webp", bio: "محامية منتسبة إلى نقابة المحامين في بيروت، متخصصة في القانون التجاري القطري والتقاضي والضرائب. تحمل ماجستير في القانون الخاص وخبرة في البحث الضريبي المقارن، وتتقن العربية والفرنسية والإنجليزية." },
  { name: "خالد عبد الوهاب", role: "مساعد محامٍ", office: "قطر", image: "/assets/team/cutouts/khaled.webp", bio: "يدعم فريق المحامين في إعداد القضايا وإجراء البحوث القانونية ومراجعة المستندات، مع اهتمام بالتفاصيل وتنظيم مسارات العمل داخل الملفات." },
  { name: "زاهر غريزي", role: "محامٍ دولي", office: "إقليمي", image: "/assets/team/cutouts/zaher.webp", bio: "محامٍ دولي بخبرة تتجاوز تسع سنوات في المملكة المتحدة وقطر والإمارات والسعودية ولبنان. خريج جامعة الحكمة وعضو في نقابة المحامين في بيروت." },
  { name: "ليندا غريزي", role: "محامية", office: "لبنان", image: "/assets/team/cutouts/linda.webp", bio: "حاصلة على بكالوريوس وماجستير في القانون من جامعة الحكمة، ومسجلة في نقابة المحامين. تشارك في إدارة الملفات وتقديم المشورة القانونية للعملاء." },
  { name: "دينا علي أبو زور", role: "محامية", office: "لبنان", image: "/assets/team/cutouts/dina.webp", bio: "محامية بخبرة تزيد على 12 عامًا في القانون المالي والعقاري. تشارك في مبادرات إصلاحية وحقوقية، وتقدم استشارات قانونية وتدرّس في جامعة الحكمة." },
  { name: "إلسا بو حدير", role: "محامية", office: "لبنان", image: "/assets/team/cutouts/elsa.webp", bio: "محامية أولى بخبرة تتجاوز عشر سنوات، متخصصة في القانونين التجاري والمدني. خريجة الجامعة اللبنانية وعضو في نقابة المحامين في بيروت، وتقدم استشارات لعملاء في عدد من أسواق الخليج." },
  { name: "دولسا إيلي الخراط", role: "محامية", office: "لبنان", image: "/assets/team/cutouts/dolsa.webp", bio: "محامية بخبرة تتجاوز 12 عامًا في الملفات الجنائية والمدنية والعقارية في لبنان وقطر، وخريجة الجامعة اللبنانية وعضو في نقابة المحامين في بيروت." },
  { name: "حسام الحكيم", role: "محامٍ", office: "لبنان", image: "/assets/team/cutouts/housam.webp", bio: "محامٍ بخبرة تتجاوز 12 عامًا في القوانين العقارية والتجارية والمدنية والجنائية. يحمل ماجستير في القانون العام، وله مساهمات في الإصلاحات التشريعية والمؤتمرات القانونية." },
  { name: "فيفيان مراد", role: "محامية", office: "لبنان", image: "/assets/team/cutouts/viviane.webp", bio: "حاصلة على بكالوريوس وماجستير في القانون من جامعة الحكمة، وتعمل ضمن الفريق القانوني في متابعة الملفات وإعداد الدراسات والمذكرات." },
  { name: "بهاء الدين البشير", role: "محامٍ", office: "قطر", image: "/assets/team/cutouts/bahaa.webp", bio: "محامٍ ضمن فريق المكتب، يشارك في متابعة الملفات القانونية وإعداد الأعمال اللازمة لخدمة القضايا والاستشارات." },
  { name: "لين زبيان", role: "محامية", office: "لبنان", image: "/assets/team/cutouts/leen.webp", bio: "تحمل ماجستير من الجامعة اللبنانية وعضو في نقابة المحامين في بيروت. اكتسبت خبرة في إدارة القضايا والعمل الإصلاحي والتعاون القانوني مع مكاتب في قطر." },
  { name: "ميرا عبد الخالق", role: "محامية", office: "لبنان", image: "/assets/team/cutouts/mira.webp", bio: "حاصلة على بكالوريوس في القانون من الجامعة اللبنانية وتتابع دراسات عليا في المنظمات الدولية. مسجلة في نقابة المحامين وتعمل على تمثيل العملاء ومتابعة ملفاتهم." },
  { name: "ياسمين نصر", role: "باحثة قانونية", office: "لبنان", image: "/assets/team/cutouts/yasmine.webp", bio: "تحمل ماجستير في التمويل وتتابع دراسة القانون، مع خبرة تتجاوز سبع سنوات في الإدارة والبحث القانوني وإعداد المستندات ودعم المحاكمات في عدة أسواق عربية." },
  { name: "إيمان عبد العزيز", role: "محامية", office: "مصر", image: "/assets/team/cutouts/eman.webp", bio: "محامية في مكتب مصر، تتابع الملفات القانونية المحلية وتدعم أعمال التقاضي والاستشارات الخاصة بعملاء الفرع." },
  { name: "أبو بكر عثمان", role: "مسؤول علاقات عامة", office: "قطر", image: "/assets/team/cutouts/aboubakr.webp", bio: "يتولى دعم العلاقات العامة والتنسيق المؤسسي، ويساهم في تسهيل التواصل والمتابعة بين المكتب وعملائه والجهات ذات الصلة." },
  { name: "عبد الحميد الشربيني", role: "مسؤول علاقات عامة", office: "قطر", image: "/assets/team/cutouts/abdelhamid.webp", bio: "يعمل في العلاقات العامة والتنسيق الإداري، ويدعم التواصل المنظم ومتابعة الإجراءات المرتبطة بأعمال المكتب." },
  { name: "محمد عصام قبّاوة", role: "محامٍ", office: "قطر", image: "/assets/team/cutouts/mohamed-essam.webp", bio: "محامٍ ضمن فريق المكتب، يشارك في إعداد ومتابعة الملفات القانونية وأعمال التقاضي والاستشارات." },
  { name: "محمود عبد العزيز", role: "محامٍ", office: "مصر", image: "/assets/team/cutouts/mahmoud.webp", bio: "محامٍ في مكتب مصر، يساهم في متابعة القضايا وتقديم الدعم القانوني للعملاء وفق متطلبات النظام القانوني المحلي." },
  { name: "محمد عرفات", role: "محامٍ", office: "قطر", image: "/assets/team/cutouts/mohamed-arafat.webp", bio: "محامٍ بخبرة تتجاوز عشر سنوات في القضايا المدنية والتجارية والجنائية والعمالية في قطر، ومتمكن من الأنظمة الإلكترونية للمحاكم القطرية والنيابة العامة." },
];


const descriptors: Record<string, { slug: string; category: string; practice: string }> = {
  "محمد بن عوجان الهاجري": { slug: "mohammed-al-hajri", category: "المحامون", practice: "التقاضي" },
  "صقر محمد صقر": { slug: "saqr-mohammed-saqr", category: "الشركاء", practice: "الشركات والقانون التجاري" },
  "أحمد الحوت": { slug: "ahmed-elhout", category: "الشركاء", practice: "الشركات والقانون التجاري" },
  "حنّا الناشف": { slug: "hanna-nashef", category: "المحامون", practice: "التقاضي" },
  "رفيق غريزي": { slug: "rafiq-ghraizi", category: "الشركاء", practice: "التحكيم" },
  "السيد معتوق": { slug: "al-sayed-matouq", category: "المستشارون", practice: "الملكية الفكرية" },
  "عمر صقر": { slug: "omar-saqr", category: "تطوير الأعمال والعلاقات العامة", practice: "" },
  "نهى محمود": { slug: "noha-mahmoud", category: "المحامون", practice: "التقاضي والضرائب" },
  "خالد عبد الوهاب": { slug: "khaled-abdel-wahab", category: "المحامون", practice: "البحث القانوني" },
  "زاهر غريزي": { slug: "zaher-ghraizi", category: "المحامون", practice: "" },
  "ليندا غريزي": { slug: "linda-ghraizi", category: "المحامون", practice: "" },
  "دينا علي أبو زور": { slug: "dina-abou-zour", category: "المحامون", practice: "القانون المالي والعقاري" },
  "إلسا بو حدير": { slug: "elsa-bou-hadir", category: "المحامون", practice: "الشركات والقانون التجاري" },
  "دولسا إيلي الخراط": { slug: "dolsa-el-kharrat", category: "المحامون", practice: "القانون المدني والجنائي والعقاري" },
  "حسام الحكيم": { slug: "houssam-al-hakim", category: "المحامون", practice: "القانون المدني والجنائي والعقاري" },
  "فيفيان مراد": { slug: "viviane-mrad", category: "المحامون", practice: "" },
  "بهاء الدين البشير": { slug: "bahaa-al-bashir", category: "المحامون", practice: "" },
  "لين زبيان": { slug: "lynne-zebianne", category: "المحامون", practice: "" },
  "ميرا عبد الخالق": { slug: "mira-abed-al-khalek", category: "المحامون", practice: "" },
  "ياسمين نصر": { slug: "yasmine-nasr", category: "البحث القانوني", practice: "البحث القانوني" },
  "إيمان عبد العزيز": { slug: "iman-abd-al-aziz", category: "المحامون", practice: "" },
  "أبو بكر عثمان": { slug: "abu-bakr-othman", category: "تطوير الأعمال والعلاقات العامة", practice: "" },
  "عبد الحميد الشربيني": { slug: "abdel-hamid-al-sharbini", category: "تطوير الأعمال والعلاقات العامة", practice: "" },
  "محمد عصام قبّاوة": { slug: "mohammed-essam-qabawa", category: "المحامون", practice: "" },
  "محمود عبد العزيز": { slug: "mahmoud-abdel-aziz", category: "المحامون", practice: "" },
  "محمد عرفات": { slug: "mohammad-arafat", category: "المحامون", practice: "القانون المدني والتجاري والجنائي والعمل" },
};

export const allPeople = [...featuredPeople, ...team].map(member => ({ ...member, ...descriptors[member.name], ...imageDimensions[member.image] }));
export type TeamMember = (typeof allPeople)[number];
export const remainingPeople = allPeople.slice(featuredPeople.length);
export const categories = [...new Set(allPeople.map(member => member.category))];
export const practices = [...new Set(allPeople.map(member => member.practice).filter(Boolean))];


// Keep the established feature-card design; prioritise Qatar and the requested lead card.
export const qatarPeople = allPeople.filter(member => member.office === "قطر").sort((a, b) => Number(b.slug === "mohammed-essam-qabawa") - Number(a.slug === "mohammed-essam-qabawa"));
export const regionalPeople = allPeople.filter(member => member.office !== "قطر");
export const qatarFeaturedPeople = qatarPeople.filter(member => member.slug !== "omar-saqr" && featuredPeople.some(featured => featured.name === member.name));
export const qatarRemainingPeople = qatarPeople.filter(member => !qatarFeaturedPeople.some(featured => featured.slug === member.slug));
