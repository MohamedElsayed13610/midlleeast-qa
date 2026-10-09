"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Plus, Newspaper, Users, LogOut, ExternalLink, Pencil, Trash2, Upload, Search, X, Check, FileText, CalendarCheck } from "lucide-react";
import { compactOnlySlugs } from "@/lib/cms-types";
import type { CmsNews, CmsTeam } from "@/lib/cms-types";
import { api, ApiError, json } from "@/lib/admin-client";
import AdminConsultations from "@/components/admin-consultations";
type Kind="news"|"team";
type Item=CmsNews|CmsTeam;
type Fields=Record<string,string|number|boolean|null>;
function newFields(kind:Kind):Fields {
  const slug=`${kind}-${crypto.randomUUID().slice(0,8)}`;
  return kind==="news" ? {slug,title:"",excerpt:"",content:"",category:"أخبار المكتب",author:"",image_url:"",image_alt:"",published_at:new Date().toISOString().slice(0,10),status:"draft"} : {slug,name:"",role:"",office:"قطر",category:"محامٍ",practice:"",bio:"",image_url:"",image_width:1,image_height:1,featured:false,is_active:true,sort_order:100};
}
const titleOf=(item:Item)=>"title" in item ? item.title : item.name;
export default function AdminDashboard({configured,previewTeam,previewNews,initialView="content"}:{configured:boolean;previewTeam:CmsTeam[];previewNews:CmsNews[];initialView?:"content"|"consultations"}) {
  const [email,setEmail]=useState<string|null>(configured ? null : "preview");
  const [checking,setChecking]=useState(configured);
  const [kind,setKind]=useState<Kind>("news"); const [view,setView]=useState<"content"|"consultations">(initialView); const [consultNew,setConsultNew]=useState(0);
  const showView=(next:"content"|"consultations",path:string)=>{setView(next);setError("");try{window.history.replaceState(null,"",path);}catch{/* URL sync is cosmetic */}};
  const [news,setNews]=useState<CmsNews[]>(previewNews); const [team,setTeam]=useState<CmsTeam[]>(previewTeam);
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("");
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  const [editor,setEditor]=useState<{kind:Kind;item:Item|null}|null>(null); const [deleting,setDeleting]=useState<Item|null>(null);
  const [loaded,setLoaded]=useState(!configured); const deleteDialog=useRef<HTMLDialogElement>(null);
  async function reload() {
    const [a,b]=await Promise.all([api("content/news"),api("content/team")]);setNews(a.items as CmsNews[]);setTeam(b.items as CmsTeam[]);setLoaded(true);
    // Sidebar badge only; consultations failing (e.g. migration not applied yet) must never block news/team.
    api("consultations").then(c=>setConsultNew((c.items as {status:string}[]).filter(i=>i.status==="new").length)).catch(()=>undefined);
  }
  function report(value:unknown) {
    if(value instanceof ApiError && [401,403].includes(value.status)) {setEmail(null);setLoaded(false);setNews([]);setTeam([]);setEditor(null);}
    setError(value instanceof Error ? value.message : "تعذّر الاتصال.");
  }
  useEffect(()=>{
    if(!configured) return;let active=true;
    api("session").then(async data=>{if(active) {setEmail(data.email);await reload();}}).catch(value=>{if(active && !(value instanceof ApiError && value.status===401)) report(value);}).finally(()=>{if(active)setChecking(false);});
    return()=>{active=false;};
    // Initial session lookup; subsequent requests recheck permissions on the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[configured]);
  useEffect(()=>{if(deleting) deleteDialog.current?.showModal();else deleteDialog.current?.close();},[deleting]);
  async function login(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError("");const form=new FormData(event.currentTarget);
    try {const data=await api("login",json("POST",{email:form.get("email"),password:form.get("password")}));setEmail(data.email);await reload();}
    catch(value){report(value);} finally{setBusy(false);}
  }
  async function logout() {
    setBusy(true);setError("");try {await api("logout",{method:"POST"});setEmail(null);setNews([]);setTeam([]);setLoaded(false);setEditor(null);setMessage("");}
    catch(value){report(value);} finally{setBusy(false);}
  }
  async function remove() {
    if(!deleting) return;setBusy(true);setError("");
    try {await api(`content/${kind}/${deleting.id}`,json("DELETE",{expected_updated_at:deleting.updated_at}));setDeleting(null);await reload();setMessage("تم حذف المحتوى.");}
    catch(value){setDeleting(null);report(value);} finally{setBusy(false);}
  }
  const items:Item[]=kind==="news" ? news : team;
  const visible=items.filter(item=>titleOf(item).includes(search) && (!filter || ("status" in item ? item.status===filter : (item.is_active ? "active" : "hidden")===filter)));
  if(checking) return <main className="cms-login" dir="rtl"><p role="status">جارٍ التحقق من الجلسة…</p></main>;
  if(!email) return <main className="cms-login" dir="rtl"><div className="cms-login-card"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt="شعار المكتب"/><span className="cms-eyebrow">الشرق الأوسط وشركاؤه</span><h1>إدارة الموقع</h1><p>سجّل الدخول لإدارة أخبار المكتب وفريقه.</p><form onSubmit={login}><label>البريد الإلكتروني<Input name="email" type="email" dir="ltr" autoComplete="username" required maxLength={254}/></label><label>كلمة المرور<Input name="password" type="password" autoComplete="current-password" required maxLength={200}/></label>{error && <p className="cms-error" role="alert">{error}</p>}<Button type="submit" className="cms-primary" disabled={busy}>{busy ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}</Button></form><Link href="/">العودة إلى الموقع <ExternalLink size={15}/></Link><small>الحسابات مخصصة لمسؤولي المكتب.</small></div></main>;
  return <main className="cms-shell" dir="rtl">
    <aside className="cms-sidebar"><Link className="cms-brand" href="/"><img src="/assets/brand/logo-white.webp" width="44" height="44" alt=""/><span>الشرق الأوسط وشركاؤه<small>إدارة المحتوى</small></span></Link><nav aria-label="أقسام الإدارة">{([["news","الأخبار",Newspaper,news.length],["team","الفريق",Users,team.length]] as const).map(([value,label,Icon,count])=><button key={value} aria-current={view==="content" && kind===value ? "page" : undefined} onClick={()=>{setKind(value);setSearch("");setFilter("");showView("content","/admin");}}><Icon size={20}/>{label}<span>{count}</span></button>)}<button aria-current={view==="consultations" ? "page" : undefined} onClick={()=>showView("consultations","/admin/consultations")}><CalendarCheck size={20}/>الاستشارات{consultNew>0 && <span aria-label={`${consultNew} طلبات جديدة`}>{consultNew}</span>}</button></nav><div className="cms-sidebar-bottom"><Link href="/" target="_blank">عرض الموقع <ExternalLink size={16}/></Link>{configured && <><small dir="ltr">{email}</small><button onClick={logout} disabled={busy}><LogOut size={16}/> تسجيل الخروج</button></>}</div></aside>
    <div className="cms-main"><header className="cms-topbar"><span><span className="cms-dot"/>{configured ? "لوحة إدارة المكتب" : "معاينة لوحة الإدارة"}</span><div><Link href="/" target="_blank">الموقع <ExternalLink size={15}/></Link>{configured && <Button className="cms-mobile-logout" variant="ghost" aria-label="تسجيل الخروج" onClick={logout} disabled={busy}><LogOut size={16}/></Button>}</div></header>
      <div className="cms-content">
        {!configured && <div className="cms-setup" role="status"><strong>اللوحة جاهزة للتوصيل</strong><p>هذه معاينة باستخدام محتوى الموقع الحالي. الحفظ ورفع الصور وتسجيل الدخول سيعملون بعد تفعيل قاعدة بيانات المكتب وحساب المسؤول.</p></div>}
        {view==="consultations" ? <AdminConsultations configured={configured} onAuthError={report} onNewCount={setConsultNew}/> : <>
        <div className="cms-heading"><div><span className="cms-eyebrow">محتوى المكتب</span><h1>{kind==="news" ? "الأخبار والمقالات" : "فريقنا"}</h1><p>{kind==="news" ? "حدّث أخبار المكتب من مكان واحد." : "صور الفريق، بياناته وخبراته، كما تظهر على الموقع."}</p></div><Button className="cms-primary" disabled={!loaded || busy} onClick={()=>{setEditor({kind,item:null});setMessage("");setError("");}}><Plus size={18}/>{kind==="news" ? "إضافة خبر" : "إضافة عضو"}</Button></div>
        <div className="cms-stats">{kind==="news" ? <><Stat label="إجمالي الأخبار" value={news.length} icon={<Newspaper size={20}/>}/><Stat label="أخبار منشورة" value={news.filter(i=>i.status==="published").length} icon={<Check size={20}/>}/><Stat label="مسودات" value={news.filter(i=>i.status==="draft").length} icon={<FileText size={20}/>}/></> : <><Stat label="أعضاء الفريق" value={team.length} icon={<Users size={20}/>}/><Stat label="فريق قطر الظاهر" value={team.filter(i=>i.is_active && i.office==="قطر").length} icon={<Check size={20}/>}/><Stat label="أعضاء مخفيون" value={team.filter(i=>!i.is_active).length} icon={<FileText size={20}/>}/></>}</div>
        {error && <p className="cms-error" role="alert">{error}</p>}{message && <p className="cms-success" role="status">{message}</p>}
        <section className="cms-panel" aria-label={kind==="news" ? "قائمة الأخبار" : "قائمة الفريق"}><div className="cms-toolbar"><label className="cms-search"><Search size={17}/><Input aria-label="البحث بالاسم أو العنوان" placeholder={kind==="news" ? "ابحث عن خبر…" : "ابحث عن عضو…"} value={search} onChange={e=>setSearch(e.target.value)}/></label><NativeSelect aria-label="تصفية الحالة" value={filter} onChange={e=>setFilter(e.target.value)}><NativeSelectOption value="">كل الحالات</NativeSelectOption>{(kind==="news" ? [["published","منشور"],["draft","مسودة"]] : [["active","ظاهر"],["hidden","مخفي"]]).map(([v,l])=><NativeSelectOption key={v} value={v}>{l}</NativeSelectOption>)}</NativeSelect>{configured && <Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true);setError("");try{await reload();}catch(e){report(e);}finally{setBusy(false);}}}>تحديث القائمة</Button>}</div>
          {!loaded ? <div className="cms-empty">تعذّر تحميل المحتوى. اضغط تحديث القائمة للمحاولة مرة أخرى.</div> : visible.length ? <div className="cms-table-wrap"><table className="cms-table"><thead><tr><th>{kind==="news" ? "الخبر" : "العضو"}</th><th>{kind==="news" ? "التاريخ" : "المكتب / الظهور"}</th><th>الحالة</th><th>إدارة</th></tr></thead><tbody>{visible.map(item=><tr key={item.id}><td><div className="cms-item-name">{item.image_url ? <img src={item.image_url} alt="" width="44" height="44" loading="lazy"/> : <span className="cms-item-icon"><Newspaper size={20}/></span>}<div><strong>{titleOf(item)}</strong><small>{"title" in item ? item.category : item.role}</small></div></div></td><td>{"title" in item ? item.published_at ? new Date(item.published_at).toLocaleDateString("ar-QA",{timeZone:"UTC"}) : "بدون تاريخ" : <>{item.office}<small>{item.featured ? "كارت الإدارة" : "كارت الفريق"}</small></>}</td><td><span className={`cms-badge ${("status" in item ? item.status==="published" : item.is_active) ? "live" : "draft"}`}>{"status" in item ? item.status==="published" ? "منشور" : "مسودة" : item.is_active ? "ظاهر" : "مخفي"}</span></td><td><div className="cms-actions"><Button variant="ghost" size="icon" disabled={busy} aria-label={`تعديل ${titleOf(item)}`} onClick={()=>{setEditor({kind,item});setMessage("");}}><Pencil size={16}/></Button><Button variant="ghost" size="icon" disabled={!configured || busy} aria-label={`حذف ${titleOf(item)}`} onClick={()=>setDeleting(item)}><Trash2 size={16}/></Button>{"status" in item && item.status==="published" && <Link aria-label={`عرض ${item.title}`} href={`/news/${item.slug}`} target="_blank"><ExternalLink size={16}/></Link>}</div></td></tr>)}</tbody></table></div> : <div className="cms-empty"><Search size={28}/><strong>{items.length ? "لا توجد نتائج مطابقة" : kind==="news" ? "ابدأ بأول خبر للمكتب" : "أضف أول عضو للفريق"}</strong><p>{items.length ? "جرّب اسمًا آخر أو غيّر الحالة." : "اضغط زر الإضافة بالأعلى لإدخال البيانات."}</p></div>}
        </section><p className="cms-footnote">{kind==="news" ? "المسودات خاصة بالإدارة. الأخبار المنشورة تظهر على الموقع وفي صفحات الأخبار." : "محمد عصام قبّاوة أول الكروت الصغيرة في فريق قطر، وعمر صقر ضمن الفريق. تصميم كروت الإدارة ثابت."}</p>
        </>}
      </div>
    </div>
    {editor && <ContentEditor key={`${editor.kind}-${editor.item?.id || "new"}`} kind={editor.kind} item={editor.item} configured={configured} onClose={()=>setEditor(null)} onSaved={async()=>{setEditor(null);setMessage("تم حفظ التغييرات. ستظهر التحديثات عند فتح الموقع أو تحديث الصفحة.");try{await reload();}catch(e){report(e);}}} onAuthError={report}/>}
    <dialog ref={deleteDialog} className="cms-confirm" onCancel={e=>{if(busy)e.preventDefault();else setDeleting(null);}}><h2>حذف {kind==="news" ? "الخبر" : "العضو"}؟</h2><p>سيُحذف «{deleting && titleOf(deleting)}» من لوحة التحكم والموقع. يمكنك إخفاؤه بدلًا من الحذف.</p><div><Button variant="outline" disabled={busy} onClick={()=>setDeleting(null)}>إلغاء</Button><Button className="cms-danger" disabled={busy} onClick={remove}>{busy ? "جارٍ الحذف…" : "حذف نهائي"}</Button></div></dialog>
  </main>;
}
function Stat({label,value,icon}:{label:string;value:number;icon:ReactNode}) {return <div className="cms-stat"><div><span>{label}</span><strong>{value.toLocaleString("ar-QA")}</strong></div><i>{icon}</i></div>;}
function ContentEditor({kind,item,configured,onClose,onSaved,onAuthError}:{kind:Kind;item:Item|null;configured:boolean;onClose:()=>void;onSaved:()=>Promise<void>;onAuthError:(error:unknown)=>void}) {
  const [fields,setFields]=useState<Fields>(item ? {...item} : newFields(kind));
  const [dirty,setDirty]=useState(false);const [busy,setBusy]=useState(false);const [uploading,setUploading]=useState(false);const [error,setError]=useState("");const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{dialog.current?.showModal();},[]);
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  function change(name:string,value:Fields[string]) {setFields(current=>({...current,[name]:value}));setDirty(true);}
  function close() {if(busy || uploading) return;if(!dirty || window.confirm("لديك تغييرات لم تُحفظ. إغلاق النموذج؟"))onClose();}
  async function save(event:FormEvent) {
    event.preventDefault();if(!configured)return;setBusy(true);setError("");
    try{await api(`content/${kind}${item ? `/${item.id}` : ""}`,json(item ? "PATCH" : "POST",{...fields,published_at:fields.published_at || null,...(item ? {expected_updated_at:item.updated_at} : {})}));setDirty(false);await onSaved();}
    catch(value){if(value instanceof ApiError && [401,403].includes(value.status))onAuthError(value);else setError(value instanceof Error ? value.message : "تعذّر الحفظ.");}finally{setBusy(false);}
  }
  async function upload(file:File) {
    setUploading(true);setError("");
    try {
      if(file.size>3*1024*1024) throw new Error("اختر صورة أقل من 3 ميجابايت.");
      const form=new FormData();form.set("file",file);const data=await api("uploads",{method:"POST",body:form});
      setFields(current=>({...current,image_url:data.url,...(kind==="team" ? {image_width:data.width,image_height:data.height} : {})}));setDirty(true);
    } catch(value){if(value instanceof ApiError && [401,403].includes(value.status))onAuthError(value);else setError(value instanceof Error ? value.message : "تعذّر رفع الصورة.");}finally{setUploading(false);}
  }
  const input=(name:string,label:string,options:{area?:boolean;required?:boolean;max?:number;type?:string;hint?:string;wide?:boolean}={})=><label className={options.wide ? "cms-field wide" : "cms-field"}>{label}{options.area ? <Textarea value={String(fields[name]??"")} required={options.required} maxLength={options.max} rows={name==="content" ? 9 : 5} onChange={e=>change(name,e.target.value)}/> : <Input value={String(fields[name]??"")} required={options.required} maxLength={options.max} type={options.type || "text"} min={options.type==="number" ? 0 : undefined} max={options.type==="number" ? 10000 : undefined} onChange={e=>change(name,options.type==="number" ? Number(e.target.value) : e.target.value)}/>} {options.hint && <small>{options.hint}</small>}</label>;
  const protectedMember=compactOnlySlugs.includes(String(fields.slug));
  return <dialog ref={dialog} className="cms-editor" onCancel={e=>{e.preventDefault();close();}} aria-labelledby="cms-editor-title"><form onSubmit={save}><header><div><span className="cms-eyebrow">{item ? "تعديل المحتوى" : "محتوى جديد"}</span><h2 id="cms-editor-title">{kind==="news" ? item ? "تعديل الخبر" : "إضافة خبر" : item ? "تعديل عضو الفريق" : "إضافة عضو للفريق"}</h2></div><Button type="button" variant="ghost" size="icon" aria-label="إغلاق" disabled={busy || uploading} onClick={close}><X size={21}/></Button></header><div className="cms-editor-body">
    {!configured && <p className="cms-setup">معاينة فقط — الحفظ ورفع الصور يحتاجان تفعيل قاعدة البيانات.</p>}
    <div className="cms-form-grid">
      {kind==="news" ? <>{input("title","عنوان الخبر",{required:true,max:200,wide:true})}{input("excerpt","الملخص",{area:true,required:true,max:500,wide:true,hint:"وصف مختصر يظهر في الموقع ونتائج البحث."})}{input("content","محتوى الخبر",{area:true,required:true,max:50000,wide:true,hint:"اكتب النص وافصل الفقرات بسطر فارغ."})}{input("category","التصنيف",{required:true,max:80})}{input("author","الكاتب / المصدر",{max:150})}{input("published_at","تاريخ الخبر",{type:"date"})}<label className="cms-field">حالة الخبر<NativeSelect value={String(fields.status)} onChange={e=>change("status",e.target.value)}><NativeSelectOption value="draft">مسودة — خاصة بالإدارة</NativeSelectOption><NativeSelectOption value="published">منشور — يظهر للجميع</NativeSelectOption></NativeSelect></label></> : <>{input("name","اسم العضو",{required:true,max:150})}{input("role","المسمى الوظيفي",{required:true,max:200})}<label className="cms-field">المكتب<NativeSelect value={String(fields.office)} onChange={e=>{change("office",e.target.value);if(e.target.value!=="قطر")change("featured",false);}}>{["قطر","الإمارات","لبنان","مصر","إقليمي"].map(v=><NativeSelectOption key={v}>{v}</NativeSelectOption>)}</NativeSelect></label>{input("category","الفئة",{required:true,max:150})}{input("practice","مجال الممارسة",{max:250})}{input("sort_order","الترتيب",{type:"number",hint:"الرقم الأقل يظهر أولًا. محمد قبّاوة أول كروت فريق قطر."})}{input("bio","النبذة والخبرات",{area:true,required:true,max:6000,wide:true,hint:"تظهر عند الهوفر على الكارت الصغير، أو في نص كارت الإدارة."})}<label className="cms-check wide"><input type="checkbox" checked={Boolean(fields.featured)} disabled={protectedMember || fields.office!=="قطر"} onChange={e=>change("featured",e.target.checked)}/><span>عضو إدارة — يظهر في الكروت الكبيرة<small>{protectedMember ? "هذا العضو مخصص للكروت الصغيرة." : "كروت الإدارة تحتفظ بتصميمها الحالي."}</small></span></label><label className="cms-check wide"><input type="checkbox" checked={Boolean(fields.is_active)} onChange={e=>change("is_active",e.target.checked)}/><span>إظهار العضو على الموقع<small>إلغاء الاختيار يخفيه مع الاحتفاظ ببياناته.</small></span></label></>}
      <div className="cms-photo wide">{fields.image_url ? <img src={String(fields.image_url)} width="112" height="112" alt="معاينة الصورة"/> : <span className="cms-photo-empty"><Upload size={24}/></span>}<div><strong>{kind==="news" ? "صورة الخبر (اختيارية)" : "صورة العضو"}</strong><small>PNG أو JPG أو WebP، حتى 3 ميجابايت.</small><label className={`cms-upload ${!configured || busy || uploading ? "disabled" : ""}`}><Upload size={16}/>{uploading ? "جارٍ رفع الصورة…" : "اختيار صورة"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={!configured || busy || uploading} onChange={e=>{if(e.target.files?.[0])void upload(e.target.files[0]);e.target.value="";}}/></label>{kind==="news" && fields.image_url && <button type="button" disabled={busy || uploading} onClick={()=>{change("image_url","");change("image_alt","");}}>إزالة الصورة من الخبر</button>}</div></div>
      {kind==="news" && fields.image_url && input("image_alt","وصف الصورة",{required:true,max:200,wide:true,hint:"صف الصورة لمساعدة القرّاء ومحركات البحث."})}
      <label className="cms-field wide">رابط المحتوى<Input dir="ltr" value={String(fields.slug)} disabled={Boolean(item)} required pattern="[a-z0-9][a-z0-9-]{1,99}" maxLength={100} onChange={e=>change("slug",e.target.value)}/><small>{item ? "الرابط ثابت لحماية الروابط المنشورة." : "حروف إنجليزية وأرقام وشرطات، أو اترك الرابط المقترح."}</small></label>
    </div>{error && <p className="cms-error" role="alert">{error}</p>}
    </div><footer><span>{dirty ? "تغييرات لم تُحفظ" : item ? "بيانات محفوظة" : "أكمل بيانات المحتوى"}</span><div><Button type="button" variant="outline" disabled={busy || uploading} onClick={close}>إلغاء</Button><Button className="cms-primary" type="submit" disabled={!configured || busy || uploading}><Check size={16}/>{busy ? "جارٍ الحفظ…" : kind==="news" && fields.status==="draft" ? "حفظ المسودة" : "حفظ التغييرات"}</Button></div></footer></form></dialog>;
}
