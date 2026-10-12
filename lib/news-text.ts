export function cleanNewsText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .trim();
}

export function newsParagraphs(value: string | null | undefined, title?: string) {
  const cleaned = cleanNewsText(value);
  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (title && paragraphs[0] === cleanNewsText(title)) {
    return paragraphs.slice(1);
  }

  return paragraphs;
}

export function textDirection(value: string | null | undefined): "rtl" | "ltr" {
  const firstStrong = (value ?? "").match(/[A-Za-z\u0600-\u06FF]/)?.[0];
  return firstStrong && /[\u0600-\u06FF]/.test(firstStrong) ? "rtl" : "ltr";
}
