"use client";
import Link from "next/link";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, ArrowUpLeft, Building2, Check, FileText, Globe2, Landmark, MapPin, Phone, Scale, ShieldCheck, Sparkles, Upload, Video, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { bookingSchema, consultationMethods, documentRules, formatDay, formatTime, languageLabels, methodLabel, serviceOptions, serviceTitle, sniffDocument } from "@/lib/consultation";
import type { AvailabilityResponse, BookingResponse, BookingValues, DocumentMime } from "@/lib/consultation";
import { legalServices } from "@/lib/services";
import { officePhone, whatsappUrl } from "@/lib/contact";
import SlotPicker from "@/components/consultation/slot-picker";

const steps = [
  { id: "service", label: "نوع الاستشارة", hint: "اختر المجال القانوني الأقرب لموضوعك." },
  { id: "method", label: "طريقة الاستشارة", hint: "كيف تفضّل أن تتم الجلسة؟" },
  { id: "client", label: "بياناتك", hint: "نستخدمها للتواصل معك وتأكيد الموعد فقط." },
  { id: "details", label: "تفاصيل الموضوع", hint: "كلما كانت الصورة أوضح، كان الإعداد للجلسة أفضل." },
  { id: "schedule", label: "الموعد", hint: "اختر يومًا ثم الوقت المناسب من المواعيد المتاحة." },
  { id: "review", label: "مراجعة الطلب", hint: "تأكد من البيانات قبل إرسال الطلب." },
] as const;
const stepFields: FieldPath<BookingValues>[][] = [["service_slug"], ["consultation_method"], ["client_name", "client_phone", "client_email", "client_company", "preferred_language"], ["subject", "description"], ["starts_at"], []];
const serviceIcons: Record<string, LucideIcon> = { "corporate-commercial": Building2, "litigation-arbitration": Scale, "energy-natural-resources": Sparkles, "employment-immigration": ShieldCheck, "technology-telecommunications": Globe2, tax: Landmark, other: FileText };
const methodIcons: Record<string, LucideIcon> = { office: MapPin, video: Video, phone: Phone };
const blurb = (slug: string) => legalServices.find(service => service.slug === slug)?.description ?? "موضوع قانوني آخر — اشرح التفاصيل في الخطوات التالية.";
const kb = (bytes: number) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

type Attachment = { id: string; file: File; type: DocumentMime };
type Done = BookingResponse & { documentsFailed: number };

async function uploadDocument(url: string, file: File, type: DocumentMime) {
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", new Blob([file], { type }), file.name);
  const response = await fetch(url, { method: "PUT", headers: { "x-upsert": "false" }, body });
  if (!response.ok) throw new Error("upload");
}

export default function BookingFlow({ whatsappAvailable = true }: { whatsappAvailable?: boolean }) {
  const form = useForm<BookingValues>({ resolver: zodResolver(bookingSchema), mode: "onTouched", defaultValues: { client_company: "", preferred_language: "ar" } });
  const { register, watch, setValue, trigger, getValues, formState: { errors } } = form;
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState("");
  const [availability, setAvailability] = useState<{ state: "idle" | "loading" | "ready" | "error"; data?: AvailabilityResponse }>({ state: "idle" });
  const [selectedDate, setSelectedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const flowTop = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const honeypot = useRef<HTMLInputElement>(null);
  const values = watch();

  const loadAvailability = useCallback(async () => {
    setAvailability(current => ({ state: "loading", data: current.data }));
    try {
      const response = await fetch("/api/consultations/availability", { cache: "no-store" });
      const data = await response.json() as AvailabilityResponse & { error?: string };
      if (!response.ok) throw new Error(data.error);
      setAvailability({ state: "ready", data });
    } catch { setAvailability({ state: "error" }); }
  }, []);

  useEffect(() => { if (step === 4 && availability.state === "idle") void loadAvailability(); }, [step, availability.state, loadAvailability]);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    flowTop.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    panelHeading.current?.focus({ preventScroll: true });
  }, [step, done]);

  async function validFiles(selected: File[]) {
    const accepted: Attachment[] = []; let message = "";
    for (const file of selected) {
      if (files.length + accepted.length >= documentRules.maxFiles) { message = `يمكن إرفاق ${documentRules.maxFiles} مستندات كحد أقصى.`; break; }
      if (file.size === 0) { message = `«${file.name}» ملف فارغ.`; continue; }
      if (file.size > documentRules.maxBytes) { message = `«${file.name}» أكبر من 10 ميجابايت.`; continue; }
      const type = sniffDocument(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
      if (!type) { message = `«${file.name}» غير مدعوم. الصيغ المسموحة: PDF أو JPG أو PNG.`; continue; }
      accepted.push({ id: crypto.randomUUID(), file, type });
    }
    setFileError(message);
    if (accepted.length) setFiles(current => [...current, ...accepted]);
  }

  async function next() {
    if (!(await trigger(stepFields[step]))) {
      const first = stepFields[step].find(name => form.getFieldState(name).error);
      if (first) document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const target = Math.min(step + 1, steps.length - 1);
    setStep(target); setReached(current => Math.max(current, target));
  }
  const go = (target: number) => { if (target <= reached) setStep(target); };

  async function submit() {
    if (submitting) return;
    setSubmitting(true); setSubmitError("");
    try {
      const current = getValues();
      const response = await fetch("/api/consultations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, documents: files.map(item => ({ name: item.file.name, type: item.type, size: item.file.size })), website: honeypot.current?.value ?? "" }),
      });
      const data = await response.json().catch(() => ({})) as BookingResponse & { error?: string };
      if (!response.ok) {
        if (response.status === 409) {
          setValue("starts_at", "", { shouldValidate: false }); setSelectedDate(""); setStep(4); void loadAvailability();
        }
        setSubmitError(data.error || "تعذّر إرسال الطلب. بياناتك محفوظة، حاول مرة أخرى.");
        return;
      }
      const result: BookingResponse = data;
      let failed = result.documentsRejected;
      for (const upload of result.uploads) {
        const attachment = files[upload.index];
        try { if (!attachment) throw new Error("missing"); await uploadDocument(upload.signedUrl, attachment.file, attachment.type); } catch { failed += 1; }
      }
      setDone({ ...result, documentsFailed: failed });
    } catch { setSubmitError("تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى — بياناتك محفوظة في النموذج."); }
    finally { setSubmitting(false); }
  }

  const chosenDay = values.starts_at ? formatDay(values.starts_at) : "";
  const chosenTime = values.starts_at ? formatTime(values.starts_at) : "";
  const summary = useMemo(() => [
    { label: "نوع الاستشارة", value: values.service_slug ? serviceTitle(values.service_slug) : "—", step: 0 },
    { label: "طريقة الاستشارة", value: values.consultation_method ? methodLabel(values.consultation_method) : "—", step: 1 },
    { label: "الاسم", value: values.client_name || "—", step: 2 },
    { label: "الهاتف", value: values.client_phone || "—", step: 2, ltr: true },
    { label: "البريد الإلكتروني", value: values.client_email || "—", step: 2, ltr: true },
    ...(values.client_company ? [{ label: "الشركة / الجهة", value: values.client_company, step: 2 }] : []),
    { label: "اللغة المفضلة", value: languageLabels[values.preferred_language ?? "ar"], step: 2 },
    { label: "عنوان الموضوع", value: values.subject || "—", step: 3 },
    { label: "المستندات", value: files.length ? `${files.length} ${files.length === 1 ? "مستند" : "مستندات"} مرفقة` : "بدون مستندات", step: 3 },
    { label: "التاريخ", value: chosenDay || "—", step: 4 },
    { label: "الوقت", value: chosenTime || "—", step: 4 },
  ], [values.service_slug, values.consultation_method, values.client_name, values.client_phone, values.client_email, values.client_company, values.preferred_language, values.subject, files.length, chosenDay, chosenTime]);

  if (done) return <Confirmation result={done} whatsappAvailable={whatsappAvailable} ref={panelHeading} topRef={flowTop} />;

  const current = steps[step];
  const error = (name: FieldPath<BookingValues>) => errors[name]?.message as string | undefined;
  const field = (name: FieldPath<BookingValues>, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false) => (
    <div className="consult-field">
      <label htmlFor={`f-${name}`}>{label}{optional && <em> (اختياري)</em>}</label>
      <input id={`f-${name}`} aria-invalid={Boolean(error(name))} aria-describedby={error(name) ? `e-${name}` : undefined} {...register(name)} {...props} />
      {error(name) && <p id={`e-${name}`} className="consult-error" role="alert">{error(name)}</p>}
    </div>
  );

  return (
    <div className="consult-flow" ref={flowTop}>
      <nav className="consult-mobile-progress" aria-label="تقدم الطلب">
        <div><span>الخطوة {step + 1} من {steps.length}</span><strong>{current.label}</strong></div>
        <i style={{ "--progress": `${((step + 1) / steps.length) * 100}%` } as React.CSSProperties} aria-hidden="true" />
      </nav>
      <ol className="consult-rail" aria-label="خطوات الحجز">
        {steps.map((item, index) => {
          const state = index === step ? "current" : index < step ? "done" : index <= reached ? "reached" : "todo";
          return <li key={item.id} data-state={state}>
            <button type="button" disabled={index > reached || submitting} aria-current={index === step ? "step" : undefined} onClick={() => go(index)}>
              <span className="consult-rail-number">{index < step ? <Check size={14} strokeWidth={2.2} /> : String(index + 1).padStart(2, "0")}</span>
              <span className="consult-rail-label">{item.label}</span>
            </button>
          </li>;
        })}
      </ol>

      <form className="consult-panel" noValidate onSubmit={event => { event.preventDefault(); if (step === steps.length - 1) void submit(); else void next(); }}>
        <header className="consult-panel-head">
          <span className="consult-step-number" aria-hidden="true">{String(step + 1).padStart(2, "0")}</span>
          <div><h2 ref={panelHeading} tabIndex={-1}>{current.label}</h2><p>{current.hint}</p></div>
        </header>
        <div className="consult-honeypot" aria-hidden="true"><label>اترك هذا الحقل فارغًا<input ref={honeypot} tabIndex={-1} autoComplete="off" name="website" /></label></div>

        <div className="consult-step" key={current.id}>
          {step === 0 && <fieldset className="consult-choices" aria-describedby={error("service_slug") ? "e-service" : undefined}>
            <legend className="sr-only">نوع الاستشارة</legend>
            {serviceOptions.map((service, index) => { const Icon = serviceIcons[service.slug] ?? FileText; return (
              <label key={service.slug} className="consult-choice">
                <input type="radio" value={service.slug} {...register("service_slug")} />
                <span className="consult-choice-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="consult-choice-icon"><Icon size={22} strokeWidth={1.4} /></span>
                <span className="consult-choice-copy"><strong>{service.title}</strong><small>{blurb(service.slug)}</small></span>
                <span className="consult-choice-tick" aria-hidden="true"><Check size={16} /></span>
              </label>); })}
            {error("service_slug") && <p id="e-service" className="consult-error" role="alert">{error("service_slug")}</p>}
          </fieldset>}

          {step === 1 && <fieldset className="consult-methods" aria-describedby={error("consultation_method") ? "e-method" : undefined}>
            <legend className="sr-only">طريقة الاستشارة</legend>
            {consultationMethods.map(method => { const Icon = methodIcons[method.value]; return (
              <label key={method.value} className="consult-method">
                <input type="radio" value={method.value} {...register("consultation_method")} />
                <span className="consult-choice-icon"><Icon size={24} strokeWidth={1.35} /></span>
                <strong>{method.label}</strong><small>{method.hint}</small>
                <span className="consult-choice-tick" aria-hidden="true"><Check size={16} /></span>
              </label>); })}
            {error("consultation_method") && <p id="e-method" className="consult-error" role="alert">{error("consultation_method")}</p>}
          </fieldset>}

          {step === 2 && <div className="consult-grid">
            {field("client_name", "الاسم الكامل", { autoComplete: "name", maxLength: 120 })}
            {field("client_phone", "رقم الهاتف", { type: "tel", inputMode: "tel", autoComplete: "tel", dir: "ltr", placeholder: "+974 5555 5555", maxLength: 24 })}
            {field("client_email", "البريد الإلكتروني", { type: "email", inputMode: "email", autoComplete: "email", dir: "ltr", maxLength: 254 })}
            {field("client_company", "الشركة / الجهة", { autoComplete: "organization", maxLength: 150 }, true)}
            <fieldset className="consult-field consult-wide consult-segment">
              <legend>اللغة المفضلة للتواصل</legend>
              <div>{(["ar", "en"] as const).map(code => <label key={code}><input type="radio" value={code} {...register("preferred_language")} /><span>{languageLabels[code]}</span></label>)}</div>
            </fieldset>
          </div>}

          {step === 3 && <div className="consult-grid">
            <div className="consult-wide">{field("subject", "عنوان مختصر للموضوع", { maxLength: 150, placeholder: "مثال: مراجعة عقد توريد مع شركة أجنبية" })}</div>
            <div className="consult-field consult-wide">
              <label htmlFor="f-description">وصف الحالة / الاستفسار القانوني</label>
              <textarea id="f-description" rows={7} maxLength={4000} aria-invalid={Boolean(error("description"))} aria-describedby={error("description") ? "e-description" : "h-description"} {...register("description")} />
              <small id="h-description" className="consult-hint">{(values.description ?? "").length} / 4000 — لا تُرسل كلمات مرور أو بيانات بنكية.</small>
              {error("description") && <p id="e-description" className="consult-error" role="alert">{error("description")}</p>}
            </div>
            <div className="consult-wide consult-upload">
              <span className="consult-upload-title">مستندات داعمة <em>(اختياري)</em></span>
              <label className={`consult-dropzone ${files.length >= documentRules.maxFiles ? "is-full" : ""}`}>
                <Upload size={22} strokeWidth={1.4} />
                <span><strong>أرفق مستندات الملف</strong><small>PDF أو JPG أو PNG — حتى 10 ميجابايت للملف، وبحد أقصى 3 ملفات. تُحفظ بسرية ولا يطّلع عليها إلا فريق المكتب.</small></span>
                <input type="file" multiple accept={documentRules.accept} disabled={files.length >= documentRules.maxFiles} aria-describedby={fileError ? "e-files" : undefined} onChange={event => { void validFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
              </label>
              {fileError && <p id="e-files" className="consult-error" role="alert">{fileError}</p>}
              {files.length > 0 && <ul className="consult-files">{files.map(item => <li key={item.id}><FileText size={18} strokeWidth={1.4} /><span><strong>{item.file.name}</strong><small>{kb(item.file.size)}</small></span><button type="button" aria-label={`إزالة ${item.file.name}`} onClick={() => setFiles(current => current.filter(file => file.id !== item.id))}><X size={16} /></button></li>)}</ul>}
            </div>
          </div>}

          {step === 4 && <SlotPicker availability={availability} selectedDate={selectedDate} selectedStart={values.starts_at ?? ""} error={error("starts_at")} onRetry={loadAvailability}
            onDate={date => { setSelectedDate(date); setValue("starts_at", ""); form.clearErrors("starts_at"); }}
            onPick={(date, startsAt) => { setSelectedDate(date); setValue("starts_at", startsAt, { shouldValidate: true, shouldTouch: true }); }} whatsappAvailable={whatsappAvailable} />}

          {step === 5 && <div className="consult-review">
            <dl>{summary.map(row => <div key={row.label}><dt>{row.label}</dt><dd dir={row.ltr ? "ltr" : undefined} className={row.ltr ? "is-ltr" : undefined}>{row.value}</dd><button type="button" onClick={() => go(row.step)}>تعديل<span className="sr-only"> {row.label}</span></button></div>)}</dl>
            <p className="consult-notice"><ShieldCheck size={20} strokeWidth={1.4} /><span>إرسال الطلب لا يعني تأكيد الموعد نهائيًا. سيتواصل فريق المكتب معك لتأكيد الجلسة.</span></p>
            {submitError && <p className="consult-error consult-submit-error" role="alert">{submitError}</p>}
          </div>}
        </div>

        <footer className="consult-actions">
          {step > 0 && step < steps.length - 1 && <button type="button" className="consult-back" disabled={submitting} onClick={() => setStep(step - 1)}><ArrowRight size={18} />السابق</button>}
          {step === steps.length - 1 && <button type="button" className="consult-back" disabled={submitting} onClick={() => setStep(0)}>تعديل البيانات</button>}
          <button type="submit" className="button button-gold consult-next" disabled={submitting || (step === 4 && availability.state === "loading")}>
            {step === steps.length - 1 ? (submitting ? "جارٍ إرسال الطلب…" : "إرسال طلب الاستشارة") : "متابعة"}
            {step < steps.length - 1 && <ArrowLeft size={18} />}
          </button>
        </footer>
      </form>
    </div>
  );
}

const Confirmation = forwardRef<HTMLHeadingElement, { result: Done; whatsappAvailable: boolean; topRef: React.RefObject<HTMLDivElement | null> }>(function Confirmation({ result, whatsappAvailable, topRef }, ref) {
  return (
    <div className="consult-flow consult-flow-done" ref={topRef}>
      <section className="consult-success" aria-labelledby="consult-success-title" role="status">
        <span className="consult-success-mark" aria-hidden="true"><Check size={28} strokeWidth={1.6} /></span>
        <h2 id="consult-success-title" ref={ref} tabIndex={-1}>تم استلام طلب الاستشارة بنجاح.</h2>
        <p>سيقوم فريق الشرق الأوسط وشركاؤه بمراجعة الطلب والتواصل معك لتأكيد الموعد.</p>
        <div className="consult-reference"><span>رقم الطلب</span><strong dir="ltr">{result.reference}</strong></div>
        <dl className="consult-success-details">
          <div><dt>التاريخ</dt><dd>{formatDay(result.starts_at)}</dd></div>
          <div><dt>الوقت</dt><dd>{formatTime(result.starts_at)}</dd></div>
          <div><dt>طريقة الاستشارة</dt><dd>{methodLabel(result.method)}</dd></div>
        </dl>
        {result.documentsFailed > 0 && <p className="consult-notice consult-notice-warn">تعذّر رفع {result.documentsFailed === 1 ? "أحد المستندات" : `${result.documentsFailed} مستندات`}. طلبك محفوظ، ويمكنك إرسال المستندات للفريق عبر واتساب أو البريد مع ذكر رقم الطلب.</p>}
        <p className="consult-success-note">احتفظ برقم الطلب للرجوع إليه عند التواصل مع المكتب. هذا الطلب ليس تأكيدًا نهائيًا للموعد.</p>
        <div className="consult-success-actions">
          <Link className="button button-gold" href="/">العودة إلى الرئيسية</Link>
          <Link className="consult-ghost" href="/#contact">تواصل معنا <ArrowUpLeft size={16} /></Link>
          {whatsappAvailable && <a className="consult-ghost" href={whatsappUrl} target="_blank" rel="noreferrer">تواصل عبر واتساب <ArrowUpLeft size={16} /></a>}
          <a className="consult-ghost" href={officePhone.href} dir="ltr">{officePhone.display}</a>
        </div>
      </section>
    </div>
  );
});
