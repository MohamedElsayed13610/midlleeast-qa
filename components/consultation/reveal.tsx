"use client";
import { useEffect } from "react";

/** Same reveal-on-scroll behaviour as the home page, for pages that render their sections on the server. */
export default function Reveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.1, rootMargin: "0px 0px -6%" });
    document.querySelectorAll("[data-reveal]").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return null;
}
