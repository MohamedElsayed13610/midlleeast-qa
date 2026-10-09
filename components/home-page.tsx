"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { legalServices } from "@/lib/services";
import { groupTeam, teamImageSources } from "@/lib/cms-types";
import type { CmsNews, PublicTeamMember } from "@/lib/cms-types";
import { Button } from "@/components/ui/button";
import TeamCard from "@/components/team-card";
import { ArrowLeft, ArrowUpLeft, Building2, ChevronDown, Globe2, Landmark, Menu, Scale, ShieldCheck, Sparkles, X } from "lucide-react";

const services = [
  { number: "01", title: "الشركات والمعاملات التجارية", text: "من تأسيس الكيانات وصياغة العقود إلى الصفقات والمعاملات العابرة للحدود.", icon: Building2, size: "wide" },
  { number: "02", title: "المنازعات والتحكيم", text: "استراتيجيات تقاضٍ وتمثيل قانوني تُبنى على قراءة دقيقة للوقائع والمخاطر.", icon: Scale, size: "tall" },
  { number: "03", title: "الطاقة والموارد الطبيعية", text: "دعم متخصص للمشروعات الاستراتيجية والقطاعات عالية التنظيم.", icon: Sparkles, size: "" },
  { number: "04", title: "العمل والهجرة", text: "حلول عملية لعلاقات العمل، التنقل المهني، والامتثال التنظيمي.", icon: ShieldCheck, size: "" },
  { number: "05", title: "الاتصالات والتكنولوجيا", text: "مشورة قانونية تواكب الاقتصاد الرقمي والتغيرات التنظيمية المتسارعة.", icon: Globe2, size: "wide" },
  { number: "06", title: "الضرائب", text: "رؤية متكاملة للمسائل الضريبية والهيكلة المالية المعقدة.", icon: Landmark, size: "" },
];


const offices = [
  { number: "01", country: "قطر", city: "لوسيل — الدوحة", address: "منطقة المارينا، برج التوأم أ، الطابق الثامن", mark: "QA" },
  { number: "02", country: "الإمارات", city: "الفجيرة", address: "مكتب 1802، برج كرياتيف، شارع حمد بن عبدالله", mark: "AE" },
  { number: "03", country: "لبنان", city: "الحازمية — بيروت", address: "مار تقلا، شارع سعيد فريحة، مبنى كاميليا ون", mark: "LB" },
  { number: "04", country: "مصر", city: "القاهرة", address: "خدمات قانونية محلية ضمن شبكة المكتب الإقليمية", mark: "EG" },
];

export default function Home({members,news}: {members:PublicTeamMember[];news:CmsNews[]}) {
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
      document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 28);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <main dir="rtl" className="site-shell">
      <div className="page-progress" aria-hidden="true" />
      <header className="site-header">
        <a href="#top" className="brand" aria-label="الشرق الأوسط وشركاؤه — الرئيسية">
          <img src="/assets/brand/logo-white.webp" width="64" height="64" alt="شعار الشرق الأوسط وشركاؤه" />
          <span className="brand-copy"><strong>الشرق الأوسط وشركاؤه</strong><small>للمحاماة والتحكيم</small></span>
        </a>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي"><a href="#about">المكتب</a><a href="#services">الخبرات</a><a href="#team">الفريق</a><a href="#knowledge">الأخبار</a><a href="#offices">المكاتب</a></nav>
        <div className="header-actions">
          <a className="header-cta" href="#contact">استشارة قانونية <ArrowUpLeft size={16} /></a>
          <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        <nav className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="قائمة الموبايل" aria-hidden={!menuOpen}>
          {[["about","المكتب"],["services","الخبرات"],["team","الفريق"],["knowledge","الأخبار والسوابق"],["offices","المكاتب"],["contact","تواصل معنا"]].map(([id,label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
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
          <p>الشرق الأوسط وشركاؤه، مكتب محاماة واستشارات قانونية في قطر. نمثل مصالح عملائنا من لوسيل وعبر المنطقة باستراتيجيات قانونية واضحة، دقيقة، وقابلة للتنفيذ.</p>
          <div className="hero-actions"><a className="button button-gold" href="#contact">ابدأ المحادثة <ArrowLeft size={18} /></a><a className="text-link" href="#team">تعرّف على فريقنا <span>↓</span></a></div>
        </div>
        <div className="hero-firm" aria-label="الشرق الأوسط وشركاؤه للمحاماة والتحكيم">
          <span className="firm-monogram" aria-hidden="true">M&amp;P</span>
          <img src="/assets/brand/logo-white.webp" width="110" height="110" alt="شعار المكتب" />
          <strong>الشرق الأوسط<br />وشركاؤه</strong>
          <p>للمحاماة والتحكيم</p>
          <span className="firm-presence">قطر · الإمارات · لبنان · مصر</span>
        </div>
        <div className="hero-metrics"><div><strong>04</strong><span>مكاتب إقليمية</span></div><div><strong>{members.length}</strong><span>عضوًا في الفريق</span></div><div><strong>2012</strong><span>منذ عام</span></div></div>
        <a href="#about" className="scroll-cue" aria-label="انتقل إلى القسم التالي"><ChevronDown size={20} /></a>
      </section>

      <div className="practice-ticker" aria-label="مجالات الممارسة"><div className="ticker-track">{[...services, ...services].map((service, index) => <span key={`${service.title}-${index}`}><i />{service.title}</span>)}</div></div>

      <section id="about" className="about section-pad">
        <div className="section-index reveal" data-reveal><span>01</span><p>المكتب</p></div>
        <div className="about-main">
          <div className="about-title reveal" data-reveal><span className="kicker">محاماة مبنية على الفهم</span><h2>لا نكتفي بقراءة النص،<br /><em>بل نفهم ما وراء القرار.</em></h2></div>
          <div className="about-copy reveal delay-1" data-reveal><p>نعمل مع الجهات الحكومية والشركات والأفراد في ملفات محلية ودولية، ونحوّل التعقيد القانوني إلى خيارات واضحة تساعد العميل على اتخاذ القرار بثقة.</p><p>يجمع المكتب بين الخبرة أمام المحاكم، المعرفة التنظيمية، والفهم العملي لبيئة الأعمال في المنطقة.</p></div>
        </div>
        <div className="principles reveal" data-reveal><span>نزاهة لا تتغير</span><span>استراتيجية لكل ملف</span><span>تواصل مباشر</span><span>حضور إقليمي</span></div>
      </section>

      <section id="services" className="services section-pad">
        <div className="section-index light reveal" data-reveal><span>02</span><p>مجالات الخبرة</p></div>
        <div className="expertise-showcase">
          <div className="expertise-intro reveal" data-reveal><span className="kicker">حلول متصلة، لا خدمات منفصلة</span><h2>منظومة قانونية<br /><em>تتحرك مع أعمالك.</em></h2><p>نبدأ بفهم القرار التجاري، ثم نبني حوله المسار القانوني المناسب من الوقاية وحتى التمثيل أمام جهات التقاضي.</p><div className="expertise-stat"><strong>06</strong><span>مسارات خبرة تعمل<br />كمنظومة واحدة</span></div></div>
          <div className="expertise-list">{services.map((service, index) => { const Icon = service.icon; return <Link href={`/services/${legalServices[index].slug}`} className={`expertise-row reveal delay-${index % 3}`} data-reveal key={service.title}><span className="expertise-number">{service.number}</span><span className="expertise-icon"><Icon size={24} strokeWidth={1.35} /></span><div><h3>{service.title}</h3><p>{service.text}</p></div><ArrowUpLeft className="expertise-arrow" size={22} /></Link>; })}</div>
        </div>
      </section>

      <section id="team" className="team section-pad">
        <div className="team-heading reveal" data-reveal><div><div className="section-index"><span>03</span><p>فريقنا</p></div><h2>عقول قانونية متعددة،<br /><em>معيار مهني واحد.</em></h2></div><div className="team-count"><strong>{members.length}</strong><span>خبيرًا ومتخصصًا<br />ضمن شبكة واحدة</span></div></div>
        <div className="featured-stack">{qatarFeaturedPeople.map((member, index) => <article className={`featured-person reveal ${index % 2 ? "tone-sand" : "tone-green"}`} data-reveal key={member.name}><div className="featured-visual"><span className="featured-index">{String(index + 1).padStart(2, "0")}</span><span className="featured-halo" /><img src={member.image} alt={member.name} width={member.width} height={member.height} loading="lazy" decoding="async" srcSet={teamImageSources(member)} sizes="(max-width: 760px) 90vw, 45vw" /></div><div className="featured-copy"><div className="featured-meta"><span>{member.role}</span><i>{member.office}</i></div><h3>{member.name}</h3><p>{member.bio}</p><span className="featured-rule" /></div></article>)}</div>
        <div className="directory-head reveal" data-reveal><div><span>شبكة الخبراء</span><strong>فريقنا</strong></div><p>محامون ومستشارون يجمعون خبرات قانونية متنوعة.</p></div>
        <div className="compact-team-grid">{qatarRemainingPeople.map(member => <TeamCard key={member.slug} member={member} />)}</div>
        <div className="team-directory-action"><Button className="button button-gold" aria-expanded={showRegionalTeam} aria-controls="regional-team" onClick={() => setShowRegionalTeam(value => !value)}>{showRegionalTeam ? "إخفاء باقي الفريق" : "شوف الباقي"}</Button></div>
        <div id="regional-team" hidden={!showRegionalTeam}>
          <div className="directory-head"><div><span>شبكة الخبراء</span><strong>فريقنا الإقليمي</strong></div></div>
          <div className="compact-team-grid">{regionalPeople.map(member => <TeamCard key={member.slug} member={member} />)}</div>
        </div>
      </section>

      <section id="knowledge" className="knowledge section-pad">
        <div className="section-index light reveal" data-reveal><span>04</span><p>الأخبار والسوابق القضائية</p></div>
        <div className="knowledge-heading reveal" data-reveal><h2>ما يستحق<br /><em>التوقف عنده.</em></h2><p>رؤى المكتب وأبرز التطورات القضائية بصياغة واضحة تساعد صانع القرار على فهم الأثر القانوني.</p></div>
        <div className="knowledge-grid">
          {news.slice(0,4).map((item,index)=><details className={`knowledge-card ${index%2 ? "precedent-card" : "news-card"} reveal`} data-reveal key={item.slug}>
            <summary><span className="knowledge-label">{item.category}</span><div>{item.image_url && <img className="news-thumb" src={item.image_url} alt={item.image_alt} loading="lazy"/>}<h3>{item.title}</h3><p>{item.excerpt}</p></div><span className="knowledge-open">اقرأ الملخص <ArrowUpLeft size={18}/></span></summary>
            <div className="knowledge-details"><p>{item.content.slice(0,500)}{item.content.length>500 ? "…" : ""}</p><span>{item.author}</span><Link className="news-read-link" href={`/news/${item.slug}`}>اقرأ الخبر كاملًا <ArrowUpLeft size={16}/></Link></div>
          </details>)}
          {!news.length && <p>لا توجد أخبار منشورة حاليًا.</p>}
        </div>
        <Link className="news-all-link" href="/news">كل الأخبار والمقالات <ArrowUpLeft size={18}/></Link>
      </section>

      <section id="offices" className="offices section-pad">
        <div className="section-index light reveal" data-reveal><span>05</span><p>الحضور الإقليمي</p></div>
        <div className="offices-intro reveal" data-reveal><h2>معرفة محلية،<br /><em>واتصال بلا حدود.</em></h2><p>أربعة مكاتب تعمل كفريق واحد لتقديم استجابة قانونية متسقة في المنطقة.</p></div>
        <div className="offices-grid">{offices.map((office, index) => <article className={`office-card reveal delay-${index % 2}`} data-reveal key={office.country}><div className="office-card-top"><span>{office.number}</span><i>{office.mark}</i></div><div><h3>{office.country}</h3><strong>{office.city}</strong><p>{office.address}</p></div></article>)}</div>
      </section>

      <section className="insight section-pad"><div className="insight-mark" aria-hidden="true">§</div><div className="insight-copy reveal" data-reveal><span>رؤية قانونية</span><h2>القرار الأفضل يبدأ<br />بسؤال قانوني أدق.</h2><p>نبحث، نحلل، ونضع أمامك مسارًا واضحًا يحمي مصالحك ويخدم أهدافك.</p></div><div className="insight-rule reveal" data-reveal><span>بحث</span><i /><span>تحليل</span><i /><span>استراتيجية</span><i /><span>تنفيذ</span></div></section>

      <section id="contact" className="contact section-pad"><div className="contact-lines" aria-hidden="true" /><div className="contact-head reveal" data-reveal><div className="section-index light"><span>06</span><p>تواصل معنا</p></div><h2>ابدأ من<br /><em>الخطوة الصحيحة.</em></h2></div><div className="contact-panel reveal delay-1" data-reveal><p>شاركنا طبيعة المسألة القانونية، وسيتواصل معك الفريق لتحديد المسار المناسب.</p><a className="button button-gold" href="https://wa.me/97477733348" target="_blank" rel="noreferrer">تواصل عبر واتساب <ArrowUpLeft size={18} /></a><div className="contact-details"><a href="tel:+97440026487">+974 4002 6487</a><a href="tel:+97477733348">+974 7773 3348</a><a href="mailto:info@middleeast-qa.com">info@middleeast-qa.com</a></div></div></section>

      <footer><a href="#top" className="footer-brand"><img src="/assets/brand/logo-white.webp" width="45" height="45" loading="lazy" alt="" /><span>الشرق الأوسط وشركاؤه<small>للمحاماة والتحكيم</small></span></a><p>© 2026 جميع الحقوق محفوظة. <Link href="/team">فريق المحامين والمستشارين</Link></p><a href="#top" className="back-top">العودة للأعلى <ArrowUpLeft size={16} /></a></footer>
    </main>
  );
}
