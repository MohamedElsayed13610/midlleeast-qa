"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import PracticeAreasEn from "@/components/practice-areas-en";
import TeamCardEn from "@/components/team-card-en";
import type { PublicTeamMember } from "@/lib/cms-types";

const offices = [
  { number: "01", country: "Qatar", city: "Lusail — Doha", address: "Marina District, Twin Tower A, 8th Floor", mark: "QA" },
  { number: "02", country: "United Arab Emirates", city: "Fujairah", address: "Office 1802, Creative Tower, Hamad Bin Abdullah Street", mark: "AE" },
  { number: "03", country: "Lebanon", city: "Hazmieh — Beirut", address: "Mar Takla, Said Freiha Street, Camellia One Building", mark: "LB" },
  { number: "04", country: "Egypt", city: "Cairo", address: "Local legal services within the firm's regional network", mark: "EG" },
];

const featuredEnglish: Record<string,{name:string;role:string;office:string}> = {
  "mohammed-al-hajri": { name:"Mohammed bin Aujan Al-Hajri", role:"Lawyer before the Court of Cassation", office:"Qatar" },
  "saqr-mohammed-saqr": { name:"Saqr Mohammed Saqr", role:"Managing Director — Partner", office:"Qatar" },
  "ahmed-elhout": { name:"Ahmed El-Hout", role:"Lawyer — Partner", office:"Qatar" },
  "hanna-nashef": { name:"Hanna Nashef", role:"Lawyer before the Courts of Appeal and Cassation", office:"Qatar" },
  "al-sayed-matouq": { name:"Al-Sayed Matouq", role:"Senior Legal Counsel", office:"Qatar" },
  "rafiq-ghraizi": { name:"Rafiq Ghraizi", role:"Partner — Lawyer", office:"Qatar" },
};

export default function HomePageEn({members}:{members:PublicTeamMember[]}) {
  const [menuOpen,setMenuOpen]=useState(false);
  const featured=useMemo(()=>members.filter(m=>featuredEnglish[m.slug]).slice(0,6),[members]);
  const additionalTeam=useMemo(()=>members.filter(m=>!featuredEnglish[m.slug]),[members]);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting&&entry.target.classList.add("is-visible")),{threshold:.1,rootMargin:"0px 0px -6%"});
    document.querySelectorAll("[data-reveal]").forEach(el=>observer.observe(el));
    const onScroll=()=>{const page=document.documentElement;const max=page.scrollHeight-window.innerHeight;page.style.setProperty("--scroll-progress",`${max>0?(window.scrollY/max)*100:0}%`);document.querySelector(".site-header")?.classList.toggle("is-scrolled",window.scrollY>28);};
    onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>{observer.disconnect();window.removeEventListener("scroll",onScroll);};
  },[]);
  return <main dir="ltr" className="site-shell english-shell">
    <style jsx global>{`
      @media (min-width: 761px) {
        .english-shell .hero {
          grid-template-rows: minmax(0, 1fr) auto;
          padding-bottom: 24px;
        }
        .english-shell .hero-copy {
          grid-column: 1;
          grid-row: 1;
          align-self: center;
        }
        .english-shell .hero-portrait {
          grid-column: 2;
          grid-row: 1;
        }
        .english-shell .hero-metrics {
          position: relative;
          right: auto;
          left: auto;
          bottom: auto;
          grid-column: 1 / -1;
          grid-row: 2;
          width: 100%;
          margin-top: 28px;
        }
      }
      @media (min-width: 761px) and (max-width: 1100px) {
        .english-shell .hero {
          min-height: 980px;
        }
        .english-shell .hero h1 {
          font-size: clamp(3.25rem, 6.7vw, 5rem);
        }
        .english-shell .hero-copy > p {
          max-width: 520px;
          font-size: 1rem;
          line-height: 1.85;
        }
      }
    `}</style>
    <div className="page-progress" aria-hidden="true" />
    <header className="site-header">
      <a href="#top" className="brand" aria-label="Middle East & Partners Law & Arbitration — Home"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt="Middle East & Partners logo"/><span className="brand-copy"><strong>Middle East &amp; Partners</strong><small>Law &amp; Arbitration</small></span></a>
      <nav className="desktop-nav" aria-label="Main navigation"><a href="#about">Firm</a><a href="#services">Practice</a><a href="#team">Team</a><a href="#offices">Offices</a><a href="#contact">Contact</a></nav>
      <div className="header-actions"><Link className="language-switch" href="/" lang="ar">AR</Link><Link className="header-cta" href="/consultation">Legal Consultation <ArrowUpRight size={16}/></Link><button className="menu-button" type="button" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?"Close menu":"Open menu"} aria-expanded={menuOpen}>{menuOpen?<X/>:<Menu/>}</button></div>
      <nav className={`mobile-nav ${menuOpen?"is-open":""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>{[["about","Firm"],["services","Practice"],["team","Team"],["offices","Offices"],["contact","Contact"]].map(([id,label])=><a key={id} href={`#${id}`} onClick={()=>setMenuOpen(false)}>{label}</a>)}<Link href="/" lang="ar" onClick={()=>setMenuOpen(false)}>العربية</Link></nav>
    </header>

    <section id="top" className="hero"><div className="hero-spotlight" aria-hidden="true"/><div className="hero-grid" aria-hidden="true"/><div className="hero-copy"><div className="eyebrow hero-eyebrow"><span/> Regional law firm since 2012</div><h1>Law,<br/><em>with business perspective.</em></h1><p>Middle East &amp; Partners is a law and legal advisory firm serving clients from Lusail, Qatar and across the region with clear, precise and commercially grounded legal strategies.</p><div className="hero-actions"><a className="button button-gold" href="#contact">Start a conversation <ArrowRight size={18}/></a><a className="text-link" href="#team">Meet our team <span>↓</span></a></div></div><div className="hero-portrait" aria-label="Mohammed bin Aujan Al-Hajri"><div className="portrait-portal"><span>QATAR · LAW · 2012</span></div><img src="/assets/team/mohamed-bin-aujan-cutout.webp" width="1102" height="1427" alt="Mohammed bin Aujan Al-Hajri"/><div className="portrait-name"><small>Lawyer before the Court of Cassation</small><strong>Mohammed bin Aujan Al-Hajri</strong></div></div><div className="hero-metrics"><div><strong>04</strong><span>Regional offices</span></div><div><strong>{members.length}</strong><span>Team members</span></div><div><strong>2012</strong><span>Established</span></div></div><a href="#about" className="scroll-cue" aria-label="Go to next section"><ChevronDown size={20}/></a></section>

    <section id="about" className="about section-pad"><div className="section-index reveal" data-reveal><span>01</span><p>The Firm</p></div><div className="about-main"><div className="about-title reveal" data-reveal><span className="kicker">Law built on understanding</span><h2>We do more than read the law.<br/><em>We understand the decision behind it.</em></h2></div><div className="about-copy reveal delay-1" data-reveal><p>We work with government entities, companies and individuals on local and international matters, turning legal complexity into clear choices.</p><p>Our practice combines courtroom experience, regulatory knowledge and a practical understanding of business across the region.</p></div></div><div className="principles reveal" data-reveal><span>Integrity</span><span>Strategy for every matter</span><span>Direct communication</span><span>Regional reach</span></div></section>

    <PracticeAreasEn/>

    <section id="team" className="team section-pad"><div className="team-heading reveal" data-reveal><div><div className="section-index"><span>03</span><p>Our Team</p></div><h2>Different legal minds.<br/><em>One professional standard.</em></h2></div><div className="team-count"><strong>{members.length}</strong><span>professionals across<br/>one regional network</span></div></div><div className="featured-stack">{featured.map((member,index)=>{const copy=featuredEnglish[member.slug];return <article className={`featured-person reveal ${index%2?"tone-sand":"tone-green"}`} data-reveal key={member.slug}><div className="featured-visual"><span className="featured-index">{String(index+1).padStart(2,"0")}</span><span className="featured-halo"/><img src={member.image} alt={copy.name} width={member.width} height={member.height} loading="lazy" decoding="async"/></div><div className="featured-copy"><div className="featured-meta"><span>{copy.role}</span><i>{copy.office}</i></div><h3>{copy.name}</h3><p>Part of the firm's regional legal team, bringing focused experience and coordinated support to client matters.</p><span className="featured-rule"/></div></article>;})}</div><div className="directory-head reveal" data-reveal><div><span>Professional Network</span><strong>Meet the rest of our team</strong></div><p>Lawyers, legal professionals and support specialists working across the firm's regional network.</p></div><div className="compact-team-grid">{additionalTeam.map(member=><TeamCardEn key={member.slug} member={member}/>)}</div></section>

    <section id="offices" className="offices section-pad"><div className="section-index light reveal" data-reveal><span>04</span><p>Regional Presence</p></div><div className="offices-intro reveal" data-reveal><h2>Local knowledge.<br/><em>Connected across borders.</em></h2><p>Four offices working as one team to provide consistent legal support across the region.</p></div><div className="offices-grid">{offices.map((office,index)=><article className={`office-card reveal delay-${index%2}`} data-reveal key={office.country}><div className="office-card-top"><span>{office.number}</span><i>{office.mark}</i></div><div><h3>{office.country}</h3><strong>{office.city}</strong><p>{office.address}</p></div></article>)}</div></section>

    <section id="contact" className="contact section-pad"><div className="contact-lines" aria-hidden="true"/><div className="contact-head reveal" data-reveal><div className="section-index light"><span>05</span><p>Contact</p></div><h2>Start with<br/><em>the right next step.</em></h2></div><div className="contact-panel reveal delay-1" data-reveal><p>Tell us about the legal matter and our team will help identify the appropriate route.</p><div className="contact-actions"><Link className="button button-gold" href="/consultation">Book a legal consultation <ArrowUpRight size={18}/></Link><a className="button button-outline" href="https://wa.me/97477733348" target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={18}/></a></div><div className="contact-details"><a href="tel:+97455600352">+974 5560 0352</a><a href="tel:+97440026487">+974 4002 6487</a><a href="tel:+97477733348">+974 7773 3348</a><a href="mailto:info@middleeast-qa.com">info@middleeast-qa.com</a></div></div></section>

    <footer><a href="#top" className="footer-brand"><img src="/assets/brand/logo-white.webp" width="45" height="45" loading="lazy" alt=""/><span>Middle East &amp; Partners<small>Law &amp; Arbitration</small></span></a><p>© 2026 All rights reserved.</p><a href="#top" className="back-top">Back to top <ArrowUpRight size={16}/></a></footer>
  </main>;
}