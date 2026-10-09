"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Ban, CalendarClock, CalendarCheck, Check, CheckCheck, Clock, Download, FileText, Mail, Phone, RefreshCw, Search, Send, Settings2, Trash2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { api, ApiError, json } from "@/lib/admin-client";
import { consultationStatuses, formatDateTime, formatDay, formatLocalDay, formatShortDate, formatTime, localDateOf, methodLabel, serviceOptions, serviceTitle, statusLabels } from "@/lib/consultation";
import type { AdminBlockedDate, AdminConsultation, AdminDocument, AdminEvent, AdminSettings, AvailabilityResponse, ConsultationStatus } from "@/lib/consultation";
import type { CmsTeam } from "@/lib/cms-types";
import "@/app/admin/consultations.css";

type Props = { configured: boolean; onAuthError: (error: unknown) => void; onNewCount: (count: number) => void };
type Detail = { item: AdminConsultation; documents: AdminDocument[]; events: AdminEvent[] };
type Pending = { title: string; body: string; confirm: string; danger?: boolean; run: () => Promise<void> };
const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const kb = (bytes: number) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const digits = (value: string) => value.replace(/\D/g, "");
const Badge = ({ status }: { status: ConsultationStatus }) => <span className={`cc-status cc-status-${status}`}>{statusLabels[status]}</span>;

export default function AdminConsultations({ configured, onAuthError, onNewCount }: Props) {
  const [tab, setTab] = useState<"requests" | "availability">("requests");
  const [items, setItems] = useState<AdminConsultation[]>([]);
  const [loaded, setLoaded] = useState(!configured);
  const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [service, setService] = useState(""); const [date, setDate] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  // The dashboard passes fresh callbacks every render; keep ours stable so effects below do not re-fire.
  const authRef = useRef(onAuthError); const countRef = useRef(onNewCount);
  useEffect(() => { authRef.current = onAuthError; countRef.current = onNewCount; });
  const fail = useCallback((value: unknown) => {
    if (value instanceof ApiError && [401, 403].includes(value.status)) authRef.current(value);
    setError(value instanceof Error ? value.message : "تعذّر الاتصال.");
  }, []);
  const load = useCallback(async () => {
    try {
      const data = await api("consultations");
      const rows = data.items as AdminConsultation[];
      setItems(rows); setLoaded(true); setError("");
      countRef.current(rows.filter(row => row.status === "new").length);
    } catch (value) { fail(value); }
  }, [fail]);
  const closeDrawer = useCallback(() => setOpenId(null), []);
  const changed = useCallback(() => { void load(); }, [load]);
  // Initial fetch on mount; state is set after the request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (configured) void load(); }, [configured, load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase(); const qDigits = digits(search);
    return items.filter(row => (!status || row.status === status) && (!service || row.service_slug === service) && (!date || localDateOf(row.starts_at) === date)
      && (!q || row.reference_number.toLowerCase().includes(q) || row.client_name.toLowerCase().includes(q) || row.client_email.includes(q) || (qDigits.length >= 3 && digits(row.client_phone).includes(qDigits))))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [items, search, status, service, date]);
  const count = (value: ConsultationStatus) => items.filter(row => row.status === value).length;
  const [now] = useState(() => Date.now());
  const upcoming = items.filter(row => row.status === "confirmed" && Date.parse(row.starts_at) > now).length;

  return <div className="cc">
    {!configured && <div className="cms-setup" role="status"><strong>اللوحة جاهزة للتوصيل</strong><p>إدارة الاستشارات تعمل بعد تفعيل قاعدة بيانات المكتب وتطبيق ملف الترحيل db/migrations/001_online_consultations.sql.</p></div>}
    <div className="cms-heading"><div><span className="cms-eyebrow">حجوزات الاستشارات</span><h1>الاستشارات</h1><p>طلبات الاستشارة الواردة من الموقع، مع إسناد المحامي وتأكيد المواعيد وإدارة التوفر.</p></div></div>
    <div className="cc-tabs" role="tablist" aria-label="أقسام الاستشارات">
      <button role="tab" id="tab-requests" aria-selected={tab === "requests"} aria-controls="panel-requests" onClick={() => { setTab("requests"); setMessage(""); }}><CalendarCheck size={17} />الطلبات</button>
      <button role="tab" id="tab-availability" aria-selected={tab === "availability"} aria-controls="panel-availability" onClick={() => { setTab("availability"); setMessage(""); }}><Settings2 size={17} />المواعيد المتاحة</button>
    </div>
    {error && <p className="cms-error" role="alert">{error}</p>}{message && <p className="cms-success" role="status">{message}</p>}

    {tab === "requests" ? <div role="tabpanel" id="panel-requests" aria-labelledby="tab-requests">
      <div className="cms-stats cc-stats">
        <Stat label="طلبات جديدة" value={count("new")} icon={<Send size={20} />} /><Stat label="بانتظار التأكيد" value={count("pending_confirmation")} icon={<Clock size={20} />} />
        <Stat label="مؤكدة قادمة" value={upcoming} icon={<CalendarCheck size={20} />} /><Stat label="إجمالي الطلبات" value={items.length} icon={<FileText size={20} />} />
      </div>
      <section className="cms-panel" aria-label="قائمة طلبات الاستشارة">
        <div className="cms-toolbar">
          <label className="cms-search"><Search size={17} /><Input aria-label="بحث بالاسم أو الهاتف أو البريد أو رقم الطلب" placeholder="ابحث بالاسم أو الهاتف أو البريد أو رقم الطلب…" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <NativeSelect aria-label="تصفية حسب الحالة" value={status} onChange={event => setStatus(event.target.value)}><NativeSelectOption value="">كل الحالات</NativeSelectOption>{consultationStatuses.map(value => <NativeSelectOption key={value} value={value}>{statusLabels[value]}</NativeSelectOption>)}</NativeSelect>
          <NativeSelect aria-label="تصفية حسب الخدمة" value={service} onChange={event => setService(event.target.value)}><NativeSelectOption value="">كل الخدمات</NativeSelectOption>{serviceOptions.map(option => <NativeSelectOption key={option.slug} value={option.slug}>{option.title}</NativeSelectOption>)}</NativeSelect>
          <label className="cc-date"><span className="sr-only">تصفية بتاريخ الموعد</span><Input type="date" aria-label="تصفية بتاريخ الموعد" value={date} onChange={event => setDate(event.target.value)} /></label>
          {(search || status || service || date) && <Button variant="ghost" onClick={() => { setSearch(""); setStatus(""); setService(""); setDate(""); }}>مسح التصفية</Button>}
          {configured && <Button variant="outline" onClick={() => { setMessage(""); void load(); }}><RefreshCw size={15} />تحديث</Button>}
        </div>
        {!loaded ? <div className="cms-empty">{error ? "تعذّر تحميل الطلبات. اضغط تحديث للمحاولة مرة أخرى." : "جارٍ تحميل الطلبات…"}</div> : visible.length ? <div className="cms-table-wrap"><table className="cms-table cc-table">
          <thead><tr><th>الطلب</th><th>العميل</th><th>الخدمة / الطريقة</th><th>الموعد المطلوب</th><th>المحامي</th><th>الحالة</th><th>تاريخ الإنشاء</th></tr></thead>
          <tbody>{visible.map(row => <tr key={row.id} className={row.status === "new" ? "is-new" : undefined}>
            <td data-label="الطلب"><button className="cc-open" onClick={() => setOpenId(row.id)} aria-label={`فتح الطلب ${row.reference_number}`}><strong dir="ltr">{row.reference_number}</strong><small>{row.subject}</small></button></td>
            <td data-label="العميل"><strong>{row.client_name}</strong><small dir="ltr">{row.client_phone}</small></td>
            <td data-label="الخدمة"><strong>{serviceTitle(row.service_slug)}</strong><small>{methodLabel(row.consultation_method)}</small></td>
            <td data-label="الموعد"><strong>{formatShortDate(row.starts_at)}</strong><small>{formatTime(row.starts_at)}</small></td>
            <td data-label="المحامي">{row.assigned?.name ?? <small>غير مُسند</small>}</td>
            <td data-label="الحالة"><Badge status={row.status} /></td>
            <td data-label="الإنشاء"><small>{formatShortDate(row.created_at)}</small></td>
          </tr>)}</tbody></table></div>
          : <div className="cms-empty"><Search size={28} /><strong>{items.length ? "لا توجد نتائج مطابقة" : "لا توجد طلبات استشارة بعد"}</strong><p>{items.length ? "جرّب تعديل البحث أو التصفية." : "ستظهر هنا الطلبات فور وصولها من صفحة حجز الاستشارة."}</p></div>}
      </section>
      <p className="cms-footnote">يُعرض أحدث 500 طلب. المواعيد بتوقيت قطر. لا تُرسل إشعارات بريدية تلقائيًا — راجع هذه الصفحة للطلبات الجديدة.</p>
    </div> : <div role="tabpanel" id="panel-availability" aria-labelledby="tab-availability"><Availability configured={configured} fail={fail} setMessage={setMessage} /></div>}

    {openId && <DetailDrawer key={openId} id={openId} fail={fail} setMessage={setMessage} onClose={closeDrawer} onChanged={changed} />}
  </div>;
}

function Stat({ label, value, icon }: { label: string; value: number; icon: ReactNode }) { return <div className="cms-stat"><div><span>{label}</span><strong>{value.toLocaleString("en")}</strong></div><i>{icon}</i></div>; }

/* ------------------------------------------------------------------ detail */
function DetailDrawer({ id, fail, setMessage, onClose, onChanged }: { id: string; fail: (e: unknown) => void; setMessage: (m: string) => void; onClose: () => void; onChanged: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const confirmDialog = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [team, setTeam] = useState<CmsTeam[]>([]);
  const [busy, setBusy] = useState(false); const [localError, setLocalError] = useState("");
  const [note, setNote] = useState(""); const [member, setMember] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [slots, setSlots] = useState<AvailabilityResponse | null>(null); const [rescheduling, setRescheduling] = useState(false); const [slotDate, setSlotDate] = useState(""); const [slotStart, setSlotStart] = useState("");

  const reload = useCallback(async () => {
    const data = await api(`consultations/${id}`) as unknown as Detail;
    setDetail(data); setMember(data.item.assigned_member_id ?? "");
  }, [id]);
  useEffect(() => { dialog.current?.showModal(); api("content/team").then(data => setTeam((data.items as CmsTeam[]).filter(item => item.is_active))).catch(() => undefined); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { reload().catch(value => { fail(value); onClose(); }); }, [reload, fail, onClose]);
  useEffect(() => { if (pending) confirmDialog.current?.showModal(); else confirmDialog.current?.close(); }, [pending]);

  async function act(body: Record<string, unknown>, success: string) {
    if (!detail) return; setBusy(true); setLocalError(""); setMessage("");
    try {
      await api(`consultations/${id}`, json("PATCH", { expected_updated_at: detail.item.updated_at, ...body }));
      await reload(); onChanged(); setMessage(success); setNote(""); setRescheduling(false);
    } catch (value) { if (value instanceof ApiError && [401, 403].includes(value.status)) fail(value); else setLocalError(value instanceof Error ? value.message : "تعذّر تنفيذ الإجراء."); if (value instanceof ApiError && value.status === 409) void reload().catch(() => undefined); }
    finally { setBusy(false); setPending(null); }
  }
  const ask = (next: Pending) => setPending(next);
  async function openReschedule() {
    setRescheduling(true); setLocalError("");
    try { const data = await api("consultations/slots") as unknown as AvailabilityResponse; setSlots(data); setSlotDate(Object.keys(data.days).sort()[0] ?? ""); setSlotStart(""); } catch (value) { fail(value); }
  }

  const item = detail?.item; const closed = item ? ["completed", "cancelled"].includes(item.status) : true;
  const label = (kind: AdminEvent) => {
    if (kind.kind === "created") return "تم استلام الطلب";
    if (kind.kind === "status") return `تغيير الحالة: ${statusLabels[kind.from_value as ConsultationStatus] ?? kind.from_value} ← ${statusLabels[kind.to_value as ConsultationStatus] ?? kind.to_value}`;
    if (kind.kind === "reschedule") return `تغيير الموعد: ${kind.from_value ? formatDateTime(kind.from_value) : "—"} ← ${kind.to_value ? formatDateTime(kind.to_value) : "—"}`;
    if (kind.kind === "assign") return `إسناد المحامي: ${kind.to_value ?? "بدون إسناد"}`;
    return "ملاحظة داخلية";
  };

  return <dialog ref={dialog} className="cc-drawer" aria-labelledby="cc-drawer-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === dialog.current && !busy) onClose(); }}>
    <header><div><span className="cms-eyebrow">طلب استشارة</span><h2 id="cc-drawer-title" dir="ltr">{item?.reference_number ?? "…"}</h2></div>{item && <Badge status={item.status} />}<Button type="button" variant="ghost" size="icon" aria-label="إغلاق" onClick={() => !busy && onClose()}><X size={21} /></Button></header>
    {!item ? <div className="cc-drawer-body"><p role="status">جارٍ تحميل الطلب…</p></div> : <div className="cc-drawer-body">
      {localError && <p className="cms-error" role="alert">{localError}</p>}
      <section className="cc-block"><h3>الإجراءات</h3><div className="cc-actions">
        {item.status === "new" && <Button variant="outline" disabled={busy} onClick={() => ask({ title: "نقل الطلب إلى «بانتظار التأكيد»؟", body: "استخدم هذه الحالة بعد مراجعة الطلب وبدء التواصل مع العميل.", confirm: "نقل الطلب", run: () => act({ action: "set_status", status: "pending_confirmation" }, "تم نقل الطلب إلى بانتظار التأكيد.") })}><Clock size={16} />بانتظار التأكيد</Button>}
        {["new", "pending_confirmation"].includes(item.status) && <Button className="cms-primary" disabled={busy} onClick={() => ask({ title: "تأكيد الموعد؟", body: `سيصبح الموعد ${formatDateTime(item.starts_at)} مؤكدًا. تواصل مع العميل لإبلاغه.`, confirm: "تأكيد الموعد", run: () => act({ action: "set_status", status: "confirmed" }, "تم تأكيد الموعد.") })}><Check size={16} />تأكيد الموعد</Button>}
        {item.status === "confirmed" && <Button className="cms-primary" disabled={busy} onClick={() => ask({ title: "وضع علامة «مكتمل»؟", body: "يُغلق الطلب ولا يمكن تغيير حالته بعد ذلك.", confirm: "تم إكمال الاستشارة", run: () => act({ action: "set_status", status: "completed" }, "تم إكمال الاستشارة.") })}><CheckCheck size={16} />تم إكمال الاستشارة</Button>}
        {!closed && <Button variant="outline" disabled={busy} onClick={() => void openReschedule()}><CalendarClock size={16} />تغيير الموعد</Button>}
        {!closed && <Button className="cms-danger" disabled={busy} onClick={() => ask({ title: "إلغاء الطلب؟", body: "سيُلغى الطلب ويعود الموعد متاحًا للحجز من جديد. لا يمكن التراجع.", confirm: "إلغاء الطلب", danger: true, run: () => act({ action: "set_status", status: "cancelled" }, "تم إلغاء الطلب.") })}><Ban size={16} />إلغاء الطلب</Button>}
        {closed && <p className="cc-muted">هذا الطلب مغلق ولا يقبل تغيير الحالة أو الموعد.</p>}
      </div>
      {rescheduling && <div className="cc-reschedule"><strong>اختر موعدًا جديدًا</strong>
        {slots && Object.keys(slots.days).length ? <><div className="cms-form-grid">
          <label className="cms-field">اليوم<NativeSelect value={slotDate} onChange={event => { setSlotDate(event.target.value); setSlotStart(""); }}>{Object.keys(slots.days).sort().map(day => <NativeSelectOption key={day} value={day}>{formatLocalDay(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</NativeSelectOption>)}</NativeSelect></label>
          <label className="cms-field">الوقت<NativeSelect value={slotStart} onChange={event => setSlotStart(event.target.value)}><NativeSelectOption value="">اختر الوقت</NativeSelectOption>{(slots.days[slotDate] ?? []).map(slot => <NativeSelectOption key={slot.starts_at} value={slot.starts_at}>{formatTime(slot.starts_at)}</NativeSelectOption>)}</NativeSelect></label></div>
          <div className="cc-actions"><Button variant="outline" onClick={() => setRescheduling(false)}>تراجع</Button><Button className="cms-primary" disabled={!slotStart || busy} onClick={() => ask({ title: "تغيير موعد الاستشارة؟", body: `سينتقل الموعد إلى ${formatDateTime(slotStart)}. أبلغ العميل بالتغيير.`, confirm: "تغيير الموعد", run: () => act({ action: "reschedule", starts_at: slotStart }, "تم تغيير الموعد.") })}>حفظ الموعد الجديد</Button></div></>
          : <p className="cc-muted">{slots ? "لا توجد مواعيد متاحة حاليًا." : "جارٍ تحميل المواعيد…"}</p>}</div>}
      </section>

      <section className="cc-block"><h3>العميل</h3><dl className="cc-dl">
        <div><dt><UserRound size={15} />الاسم</dt><dd>{item.client_name}</dd></div>
        <div><dt><Phone size={15} />الهاتف</dt><dd><a href={`tel:${item.client_phone.replace(/[^\d+]/g, "")}`} dir="ltr">{item.client_phone}</a></dd></div>
        <div><dt><Mail size={15} />البريد</dt><dd><a href={`mailto:${item.client_email}`} dir="ltr">{item.client_email}</a></dd></div>
        {item.client_company && <div><dt>الجهة</dt><dd>{item.client_company}</dd></div>}
        <div><dt>اللغة المفضلة</dt><dd>{item.preferred_language === "ar" ? "العربية" : "English"}</dd></div>
      </dl></section>

      <section className="cc-block"><h3>الموعد والخدمة</h3><dl className="cc-dl">
        <div><dt>التاريخ</dt><dd>{formatDay(item.starts_at)}</dd></div><div><dt>الوقت</dt><dd>{formatTime(item.starts_at)} — {item.duration_minutes} دقيقة</dd></div>
        <div><dt>الطريقة</dt><dd>{methodLabel(item.consultation_method)}</dd></div><div><dt>الخدمة</dt><dd>{serviceTitle(item.service_slug)}</dd></div>
        <div><dt>تاريخ الطلب</dt><dd>{formatDateTime(item.created_at)}</dd></div>
      </dl></section>

      <section className="cc-block"><h3>موضوع الاستشارة</h3><p className="cc-subject">{item.subject}</p><p className="cc-brief">{item.description}</p></section>

      <section className="cc-block"><h3>المستندات ({detail?.documents.length ?? 0})</h3>
        {detail?.documents.length ? <ul className="cc-docs">{detail.documents.map(doc => <li key={doc.id}><FileText size={18} /><span><strong>{doc.original_name}</strong><small dir="ltr">{kb(doc.size_bytes)} · {doc.mime_type.split("/")[1].toUpperCase()}</small></span><a href={`/api/admin/consultations/${id}/documents/${doc.id}`} download aria-label={`تحميل ${doc.original_name}`}><Download size={17} />تحميل</a></li>)}</ul> : <p className="cc-muted">لم يُرفق العميل مستندات.</p>}
        <p className="cc-muted">المستندات خاصة، وتُحمَّل عبر حساب المسؤول فقط.</p></section>

      <section className="cc-block"><h3>المحامي المسؤول</h3>
        <div className="cc-assign"><label className="cms-field"><span className="sr-only">المحامي المسؤول</span><NativeSelect aria-label="المحامي المسؤول" value={member} disabled={busy || closed} onChange={event => setMember(event.target.value)}><NativeSelectOption value="">غير مُسند</NativeSelectOption>{team.map(person => <NativeSelectOption key={person.id} value={person.id}>{person.name} — {person.role}</NativeSelectOption>)}</NativeSelect></label>
          <Button variant="outline" disabled={busy || closed || member === (item.assigned_member_id ?? "")} onClick={() => void act({ action: "assign", member_id: member || null }, member ? "تم إسناد المحامي." : "تم إلغاء الإسناد.")}>حفظ الإسناد</Button></div>
        {item.assigned && <p className="cc-muted">المسؤول الحالي: {item.assigned.name}</p>}</section>

      <section className="cc-block"><h3>ملاحظات داخلية وسجل الطلب</h3>
        <form className="cc-note" onSubmit={event => { event.preventDefault(); if (note.trim()) void act({ action: "add_note", note }, "تمت إضافة الملاحظة."); }}>
          <label className="cms-field"><span className="sr-only">ملاحظة داخلية</span><Textarea aria-label="ملاحظة داخلية" rows={3} maxLength={2000} placeholder="ملاحظة للفريق فقط — لا تظهر للعميل" value={note} onChange={event => setNote(event.target.value)} /></label>
          <Button type="submit" className="cms-primary" disabled={busy || !note.trim()}>إضافة ملاحظة</Button></form>
        <ol className="cc-timeline">{detail?.events.map(event => <li key={event.id} data-kind={event.kind}><div><strong>{label(event)}</strong>{event.note && <p>{event.note}</p>}<small>{formatDateTime(event.created_at)}{event.actor_email ? ` · ${event.actor_email}` : ""}</small></div></li>)}</ol></section>
    </div>}
    <dialog ref={confirmDialog} className="cms-confirm" onCancel={event => { event.preventDefault(); if (!busy) setPending(null); }} onClick={event => event.stopPropagation()}>
      <h2>{pending?.title}</h2><p>{pending?.body}</p>
      <div><Button variant="outline" disabled={busy} onClick={() => setPending(null)}>رجوع</Button><Button className={pending?.danger ? "cms-danger" : "cms-primary"} disabled={busy} onClick={() => void pending?.run()}>{busy ? "جارٍ التنفيذ…" : pending?.confirm}</Button></div>
    </dialog>
  </dialog>;
}

/* ------------------------------------------------------------------ availability */
function Availability({ configured, fail, setMessage }: { configured: boolean; fail: (e: unknown) => void; setMessage: (m: string) => void }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null); const [blocked, setBlocked] = useState<AdminBlockedDate[]>([]);
  const [busy, setBusy] = useState(false); const [localError, setLocalError] = useState("");
  const [newDate, setNewDate] = useState(""); const [reason, setReason] = useState(""); const [removing, setRemoving] = useState<AdminBlockedDate | null>(null);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const load = useCallback(async () => { const data = await api("consultations/availability") as unknown as { settings: AdminSettings; blocked: AdminBlockedDate[] }; setSettings({ ...data.settings, start_time: data.settings.start_time.slice(0, 5), end_time: data.settings.end_time.slice(0, 5) }); setBlocked(data.blocked); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (configured) load().catch(fail); }, [configured, load, fail]);
  useEffect(() => { if (removing) confirmDialog.current?.showModal(); else confirmDialog.current?.close(); }, [removing]);
  if (!configured) return <div className="cms-empty">فعّل قاعدة البيانات لإدارة المواعيد المتاحة.</div>;
  if (!settings) return <div className="cms-empty" role="status">جارٍ تحميل الإعدادات…</div>;
  const set = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => setSettings(current => current && { ...current, [key]: value });
  const today = new Date().toISOString().slice(0, 10);

  async function save() {
    if (!settings) return; setBusy(true); setLocalError(""); setMessage("");
    try { await api("consultations/availability", json("PUT", { working_days: settings.working_days, start_time: settings.start_time, end_time: settings.end_time, slot_minutes: Number(settings.slot_minutes), min_notice_hours: Number(settings.min_notice_hours), max_advance_days: Number(settings.max_advance_days), expected_updated_at: settings.updated_at })); await load(); setMessage("تم حفظ إعدادات المواعيد."); }
    catch (value) { if (value instanceof ApiError && [401, 403].includes(value.status)) fail(value); else setLocalError(value instanceof Error ? value.message : "تعذّر الحفظ."); }
    finally { setBusy(false); }
  }
  async function addBlocked() {
    setBusy(true); setLocalError(""); setMessage("");
    try { await api("consultations/availability/blocked", json("POST", { blocked_on: newDate, reason })); setNewDate(""); setReason(""); await load(); setMessage("تمت إضافة التاريخ المحجوب."); }
    catch (value) { if (value instanceof ApiError && [401, 403].includes(value.status)) fail(value); else setLocalError(value instanceof Error ? value.message : "تعذّر الإضافة."); }
    finally { setBusy(false); }
  }
  async function removeBlocked() {
    if (!removing) return; setBusy(true); setLocalError("");
    try { await api("consultations/availability/blocked", json("DELETE", { id: removing.id })); await load(); setMessage("تمت إزالة التاريخ المحجوب."); }
    catch (value) { if (value instanceof ApiError && [401, 403].includes(value.status)) fail(value); else setLocalError(value instanceof Error ? value.message : "تعذّر الحذف."); }
    finally { setBusy(false); setRemoving(null); }
  }

  return <div className="cc-availability">
    {localError && <p className="cms-error" role="alert">{localError}</p>}
    <section className="cms-panel cc-card"><h2>أوقات العمل</h2><p className="cc-muted">تنطبق على الحجوزات الجديدة فقط، ولا تغيّر الطلبات القائمة. التوقيت بتوقيت قطر.</p>
      <fieldset className="cc-days"><legend>أيام العمل</legend>{dayNames.map((name, index) => <label key={name} className="cms-check"><input type="checkbox" checked={settings.working_days.includes(index)} onChange={event => set("working_days", event.target.checked ? [...settings.working_days, index].sort() : settings.working_days.filter(day => day !== index))} /><span>{name}</span></label>)}</fieldset>
      <div className="cms-form-grid">
        <label className="cms-field">بداية الدوام<Input type="time" value={settings.start_time} onChange={event => set("start_time", event.target.value)} /></label>
        <label className="cms-field">نهاية الدوام<Input type="time" value={settings.end_time} onChange={event => set("end_time", event.target.value)} /></label>
        <label className="cms-field">مدة الجلسة<NativeSelect value={String(settings.slot_minutes)} onChange={event => set("slot_minutes", Number(event.target.value))}>{[15, 20, 30, 45, 60, 90, 120].map(minutes => <NativeSelectOption key={minutes} value={minutes}>{minutes} دقيقة</NativeSelectOption>)}</NativeSelect></label>
        <label className="cms-field">أقل مهلة قبل الموعد (ساعات)<Input type="number" min={0} max={168} value={settings.min_notice_hours} onChange={event => set("min_notice_hours", Number(event.target.value))} /></label>
        <label className="cms-field">أقصى حجز مسبق (أيام)<Input type="number" min={1} max={180} value={settings.max_advance_days} onChange={event => set("max_advance_days", Number(event.target.value))} /></label>
      </div>
      <div className="cc-actions"><Button className="cms-primary" disabled={busy} onClick={() => void save()}><Check size={16} />{busy ? "جارٍ الحفظ…" : "حفظ الإعدادات"}</Button></div></section>
    <section className="cms-panel cc-card"><h2>تواريخ غير متاحة</h2><p className="cc-muted">إجازات أو أيام مغلقة لا تظهر فيها مواعيد للحجز.</p>
      <form className="cc-blocked-form" onSubmit={event => { event.preventDefault(); if (newDate) void addBlocked(); }}>
        <label className="cms-field">التاريخ<Input type="date" min={today} value={newDate} required onChange={event => setNewDate(event.target.value)} /></label>
        <label className="cms-field">السبب (اختياري)<Input maxLength={200} value={reason} onChange={event => setReason(event.target.value)} /></label>
        <Button type="submit" className="cms-primary" disabled={busy || !newDate}>إضافة</Button></form>
      {blocked.length ? <ul className="cc-blocked">{blocked.map(item => <li key={item.id}><span><strong>{formatLocalDay(item.blocked_on, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>{item.reason && <small>{item.reason}</small>}</span><Button variant="ghost" size="icon" aria-label={`إزالة ${item.blocked_on}`} disabled={busy} onClick={() => setRemoving(item)}><Trash2 size={16} /></Button></li>)}</ul> : <p className="cc-muted">لا توجد تواريخ محجوبة.</p>}</section>
    <dialog ref={confirmDialog} className="cms-confirm" onCancel={event => { event.preventDefault(); if (!busy) setRemoving(null); }}><h2>إزالة التاريخ المحجوب؟</h2><p>سيعود هذا اليوم متاحًا للحجز إن كان من أيام العمل.</p><div><Button variant="outline" disabled={busy} onClick={() => setRemoving(null)}>رجوع</Button><Button className="cms-danger" disabled={busy} onClick={() => void removeBlocked()}>إزالة</Button></div></dialog>
  </div>;
}
