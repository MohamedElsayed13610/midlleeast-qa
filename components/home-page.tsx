"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { legalServices } from "@/lib/services";
import { groupTeam, teamImageSources } from "@/lib/cms-types";
import type { CmsNews, CmsPartner, PublicTeamMember } from "@/lib/cms-types";
import { Button } from "@/components/ui/button";
import TeamCard from "@/components/team-card";
import PartnersSection from "@/components/partners-section";
import LatestNewsSection from "@/components/latest-news-section";
import { ArrowLeft, ArrowUpLeft, ChevronDown, Menu, X } from "lucide-react";

const offices = [
  { number: "01", country: "قطر", city: "لوسيل — الدوحة", address: "منطقة المارينا، برج التوأم أ، الطابق الثامن", mark: "QA" },
  { number: "02", country: "الإمارات", city: "الفجيرة", address: "مكتب 1802، برج كرياتيف، شارع حمد بن عبدالله", mark: "AE" },
  { number: "03", country: "لبنان", city: "الحازمية — بيروت", address: "مار تقلا، شارع سعيد فريحة، مبنى كاميليا ون", mark: "LB" },
  { number: "04", country: "مصر", city: "القاهرة", address: "خدمات قانونية محلية ضمن شبكة المكتب الإقليمية", mark: "EG" },
];

export default function Home({members,news,partners}: {members:PublicTeamMember[];news:CmsNews[];partners:CmsPartner[]}) {
  const {featured:qatarFeaturedPeople,compact:qatarRemainingPeople,regional:regionalPeople}=groupTeam(members);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRegionalTeam, setShowRegionalTeam] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.1, rootMargin: "0px 0px -6%" });
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    const onScroll = () => {
      const page = document.documentElement;
      const max = page.scrollHeight - window.innerHeight;
      page.style.setProperty("--scroll-progress", `${max > 0 ? (window.scrollY / max) * 100 : 0}%`);
      document.querySelector(".site-header")?.classList.toggle("is-scrolled",window.scrollY > 28);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <main dir="rtl" className="site-shell">
      <div className="page-progress" aria-hidden="true" />
      <header className="site-header">
        <a href="#top" className="brand" aria-label="الشرق الأوسط ومشاركوه للمحاماة والتحكيم — الرئيسية">
          <img src="/assets/brand/logo-white.webp" width="64" height="64" alt="شعار الشرق الأوسط ومشاركوه للمحاماة والتحكيم" />
          <span className="brand-copy"><strong>الشرق الأوسط ومشاركوه</strong><small>للمحاماة والتحكيم</small></span>
        </a>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي"><a href="#partners">الشركاء</a><a href="#knowledge">الأخبار</a><a href="#team">الفريق</a><a href="#offices">المكاتب</a><a href="#contact">تواصل معنا</a></nav>
        <div className="header-actions">
          <Link className="language-switch" href="/en" lang="en">EN</Link>
          <Link className="header-cta" href="/consultation">استشارة قانونية <ArrowUpLeft size={16} /></Link>
          <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        <nav className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="قائمة الموبايل" aria-hidden={!menuOpen}>
          {[["partners","الشركاء"],["knowledge","الأخبار"],["team","الفريق"],["offices","المكاتب"],["contact","تواصل معنا"]].map(([id,label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <Link href="/consultation" onClick={() => setMenuOpen(false)}>احجز استشارة قانونية</Link>
          <Link href="/en" lang="en" onClick={() => setMenuOpen(false)}>English</Link>
        </nav>
      </header>

      <section id="top" className="hero" onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      }}>
        <div className="hero-spotlight" aria-hidden="true" /><div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><span /> مكتب محاماة إقليمي منذ 2012</div>
          <h1>القانون<br /><em>برؤية أعمال.</em></h1>
          <p>الشرق الأوسط ومشاركوه للمحاماة والتحكيم، مكتب محاماة واستشارات قانونية في قطر. نمثل مصالح عملائنا من لوسيل وعبر المنطقة باستراتيجيات قانونية واضحة، دقيقة، وقابلة للتنفيذ.</p>
          <div className="hero-actions"><a className="button button-gold" href="#contact">ابدأ المحادثة <ArrowLeft size={18} /></a><a className="text-link" href="#team">تعرّف على فريقنا <span>↓</span></a></div>
        </div>
        <div className="hero-portrait" aria-label="محمد بن عوجان الهاجري">
          <div className="portrait-portal"><span>QATAR · LAW · 2012</span></div>
          <img src="/assets/team/mohamed-bin-aujan-cutout.webp" width="1102" height="1427" alt="محمد بن عوجان الهاجري" />
          <div className="portrait-name"><small>محامٍ أمام محكمة التمييز</small><strong>محمد بن عوجان الهاجري</strong></div>
        </div>
        <div className="hero-metrics"><div><strong>04</strong><span>مكاتب إقليمية</span></div><div><strong>{members.length}</strong><span>عضوًا في الفريق</span></div><div><strong>2012</strong><span>منذ عام</span></div></div>
        <a href="#partners" className="scroll-cue" aria-label="انتقل إلى قسم الشركاء"><ChevronDown size={20} /></a>
      </section>

      <div id="services" className="practice-ticker" aria-label="مجالات الممارسة"><div className="ticker-track">{[...legalServices, ...legalServices].map((service, index) => <span key={`${service.title}-${index}`}><i />{service.title}</span>)}</div></div>

      <PartnersSection partners={partners} locale="ar" index="01" />
      <LatestNewsSection news={news} locale="ar" index="02" />

      <section id="team" className="team section-pad">
        <div className="team-heading reveal" data-reveal><div><div className="section-index"><span>03</span><p>فريقنا الإقليمي</p></div><h2>فريقنا الإقليمي</h2></div><div className="team-count"><strong>{members.length}</strong><span>خبيرًا ومتخصصًا<br />ضمن شبكة واحدة</span></div></div>
        <div className="featured-stack">{qatarFeaturedPeople.map((member, index) => <article className={`featured-person reveal ${index % 2 ? "tone-sand" : "tone-green"}`} data-reveal key={member.name}><div className="featured-visual"><span className="featured-index">{String(index + 1).padStart(2, "0")}</span><span className="featured-halo" /><img src={member.image} alt={member.name} width={member.width} height={member.height} loading="lazy" decoding="async" srcSet={teamImageSources(member)} sizes="(max-width: 760px) 90vw, 45vw" /></div><div className="featured-copy"><div className="featured-meta"><span>{member.role}</span><i>{member.office}</i></div><h3>{member.name}</h3><p>{member.bio}</p><span className="featured-rule" /></div></article>)}</div>
        <div className="compact-team-grid">{qatarRemainingPeople.map(member => <TeamCard key={member.slug} member={member} />)}</div>
        {regionalPeople.length > 0 && <><div className="team-directory-action"><Button className="button button-gold" aria-expanded={showRegionalTeam} aria-controls="regional-team" onClick={() => setShowRegionalTeam(value => !value)}>{showRegionalTeam ? "إخفاء باقي الفريق" : "شوف باقي الفريق"}</Button></div><div id="regional-team" hidden={!showRegionalTeam}><div className="compact-team-grid">{regionalPeople.map(member => <TeamCard key={member.slug} member={member} />)}</div></div></>}
      </section>

      <section id="offices" className="offices section-pad"><div className="section-index light reveal" data-reveal><span>04</span><p>الحضور الإقليمي</p></div><div className="offices-intro reveal" data-reveal><h2>معرفة محلية،<br /><em>واتصال بلا حدود.</em></h2><p>أربعة مكاتب تعمل كفريق واحد لتقديم استجابة قانونية متسقة في المنطقة.</p></div><div className="offices-grid">{offices.map((office, index) => <article className={`office-card reveal delay-${index % 2}`} data-reveal key={office.country}><div className="office-card-top"><span>{office.number}</span><i>{office.mark}</i></div><div><h3>{office.country}</h3><strong>{office.city}</strong><p>{office.address}</p></div></article>)}</div></section>

      <section id="contact" className="contact section-pad"><div className="contact-lines" aria-hidden="true" /><div className="contact-head reveal" data-reveal><div className="section-index light"><span>05</span><p>تواصل معنا</p></div><h2>ابدأ من<br /><em>الخطوة الصحيحة.</em></h2></div><div className="contact-panel reveal delay-1" data-reveal><p>شاركنا طبيعة المسألة القانونية، وسيتواصل معك الفريق لتحديد المسار المناسب.</p><div className="contact-actions"><Link className="button button-gold" href="/consultation">احجز استشارة قانونية <ArrowUpLeft size={18} /></Link><a className="button button-outline" href="https://wa.me/97477733348" target="_blank" rel="noreferrer">تواصل عبر واتساب <ArrowUpLeft size={18} /></a></div><div className="contact-details"><a href="tel:+97455600352">+974 5560 0352</a><a href="tel:+97440026487">+974 4002 6487</a><a href="tel:+97477733348">+974 7773 3348</a><a href="mailto:info@middleeast-qa.com">info@middleeast-qa.com</a></div></div></section>

      <footer><a href="#top" className="footer-brand"><img src="/assets/brand/logo-white.webp" width="45" height="45" loading="lazy" alt="" /><span>الشرق الأوسط ومشاركوه<small>للمحاماة والتحكيم</small></span></a><p>© 2026 جميع الحقوق محفوظة. <Link href="/team">فريق المحامين والمستشارين</Link></p><a href="#top" className="back-top">العودة للأعلى <ArrowUpLeft size={16} /></a></footer>
    </main>
  );
}
