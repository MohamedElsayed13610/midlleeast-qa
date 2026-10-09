"use client";
import { useMemo, useState } from "react";
import { CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatLocalDay, formatTime } from "@/lib/consultation";
import type { AvailabilityResponse } from "@/lib/consultation";
import { whatsappUrl } from "@/lib/contact";

const weekdays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const pad = (value: number) => String(value).padStart(2, "0");
const monthKey = (date: string) => date.slice(0, 7);
const shiftMonth = (key: string, by: number) => { const [year, month] = key.split("-").map(Number); const next = new Date(Date.UTC(year, month - 1 + by, 1)); return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}`; };

type Props = {
  availability: { state: "idle" | "loading" | "ready" | "error"; data?: AvailabilityResponse };
  selectedDate: string; selectedStart: string; error?: string; whatsappAvailable: boolean;
  onDate: (date: string) => void; onPick: (date: string, startsAt: string) => void; onRetry: () => void;
};

/** Brand-styled month grid + time slots. Availability always comes from the server; nothing is computed here. */
export default function SlotPicker({ availability, selectedDate, selectedStart, error, whatsappAvailable, onDate, onPick, onRetry }: Props) {
  const data = availability.data;
  const days = useMemo(() => data?.days ?? {}, [data]);
  const availableDates = useMemo(() => Object.keys(days).sort(), [days]);
  const [month, setMonth] = useState("");

  if (availability.state === "loading" && !data) return <div className="consult-slots-state" role="status"><span className="consult-spinner" aria-hidden="true" />جارٍ تحميل المواعيد المتاحة…</div>;
  if (availability.state === "error" || (data && !data.configured)) return (
    <div className="consult-slots-state" role="alert">
      <CalendarX2 size={28} strokeWidth={1.3} /><strong>تعذّر تحميل المواعيد الآن</strong>
      <p>يمكنك المحاولة مرة أخرى، أو التواصل مع المكتب مباشرة لحجز الموعد.</p>
      <div><button type="button" className="consult-ghost" onClick={onRetry}>إعادة المحاولة</button>{whatsappAvailable && <a className="consult-ghost" href={whatsappUrl} target="_blank" rel="noreferrer">تواصل عبر واتساب</a>}</div>
    </div>
  );
  if (!data) return null;
  if (!availableDates.length) return (
    <div className="consult-slots-state">
      <CalendarX2 size={28} strokeWidth={1.3} /><strong>لا توجد مواعيد متاحة حاليًا</strong>
      <p>جميع المواعيد القريبة محجوزة أو خارج أوقات العمل. تواصل مع المكتب وسنرتّب لك أقرب موعد ممكن.</p>
      <div>{whatsappAvailable && <a className="consult-ghost" href={whatsappUrl} target="_blank" rel="noreferrer">تواصل عبر واتساب</a>}<button type="button" className="consult-ghost" onClick={onRetry}>تحديث المواعيد</button></div>
    </div>
  );

  const key = month || monthKey(availableDates[0] ?? data.today); // first month with openings until the visitor navigates
  const [year, monthNumber] = key.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const offset = first.getUTCDay(); // Sunday = 0, rendered at the start (right) of the RTL grid
  const length = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const cells = [...Array<null>(offset).fill(null), ...Array.from({ length }, (_, index) => index + 1)];
  const canGoBack = key > monthKey(data.today);
  const canGoNext = key < monthKey(data.maxDate);
  const daySlots = selectedDate ? days[selectedDate] ?? [] : [];

  return (
    <div className="consult-schedule">
      <div className="consult-calendar">
        <div className="consult-calendar-head">
          <button type="button" aria-label="الشهر السابق" disabled={!canGoBack} onClick={() => setMonth(shiftMonth(key, -1))}><ChevronRight size={20} /></button>
          <strong aria-live="polite">{formatLocalDay(`${key}-01`, { month: "long", year: "numeric" })}</strong>
          <button type="button" aria-label="الشهر التالي" disabled={!canGoNext} onClick={() => setMonth(shiftMonth(key, 1))}><ChevronLeft size={20} /></button>
        </div>
        <div className="consult-weekdays" aria-hidden="true">{weekdays.map(day => <span key={day}>{day.replace("ال", "")}</span>)}</div>
        <div className="consult-days" role="group" aria-label="أيام الشهر">
          {cells.map((day, index) => {
            if (day === null) return <span key={`empty-${index}`} aria-hidden="true" />;
            const date = `${key}-${pad(day)}`;
            const open = days[date]?.length ?? 0;
            const selected = date === selectedDate;
            return <button key={date} type="button" disabled={!open} aria-pressed={selected} data-today={date === data.today || undefined}
              aria-label={`${formatLocalDay(date, { weekday: "long", day: "numeric", month: "long" })}${open ? ` — ${open} مواعيد متاحة` : " — غير متاح"}`}
              onClick={() => onDate(date)}><span>{day}</span>{open > 0 && <i aria-hidden="true" />}</button>;
          })}
        </div>
        <p className="consult-calendar-legend"><i aria-hidden="true" />الأيام التي تحتوي نقطة بها مواعيد متاحة · التوقيت بتوقيت قطر</p>
      </div>

      <div className="consult-times" aria-live="polite">
        {selectedDate ? <>
          <h3>{formatLocalDay(selectedDate, { weekday: "long", day: "numeric", month: "long" })}</h3>
          {daySlots.length ? <div className="consult-time-grid" role="group" aria-label="الأوقات المتاحة">
            {daySlots.map(slot => <button key={slot.starts_at} type="button" aria-pressed={slot.starts_at === selectedStart} onClick={() => onPick(selectedDate, slot.starts_at)}>{formatTime(slot.starts_at)}</button>)}
          </div> : <p className="consult-hint">لا توجد أوقات متاحة في هذا اليوم.</p>}
          <p className="consult-hint">مدة الجلسة {data.slotMinutes} دقيقة.</p>
        </> : <div className="consult-times-empty"><strong>اختر يومًا من التقويم</strong><p>ستظهر هنا الأوقات المتاحة لليوم الذي تختاره.</p></div>}
        {error && <p className="consult-error" role="alert">{error}</p>}
      </div>
    </div>
  );
}
