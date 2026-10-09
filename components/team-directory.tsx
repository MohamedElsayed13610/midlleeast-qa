"use client";

import { useState } from "react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { groupTeam } from "@/lib/cms-types";
import type { PublicTeamMember } from "@/lib/cms-types";
import { Button } from "@/components/ui/button";
import TeamCard from "@/components/team-card";

export default function TeamDirectory({members}:{members:PublicTeamMember[]}) {
  const {qatar:qatarPeople,regional:regionalPeople}=groupTeam(members);
  const categories=[...new Set(members.map(member=>member.category))];
  const practices=[...new Set(members.map(member=>member.practice).filter(Boolean))];
  const [showRegionalTeam, setShowRegionalTeam] = useState(false);
  const [category, setCategory] = useState("");
  const [practice, setPractice] = useState("");
  const people = (showRegionalTeam ? [...qatarPeople, ...regionalPeople] : qatarPeople).filter(member => (!category || member.category === category) && (!practice || member.practice === practice));
  return <>
    <div className="directory-scope"><span>{showRegionalTeam ? "كل أعضاء الفريق" : "فريق قطر"}</span><Button className="button button-gold" aria-expanded={showRegionalTeam} onClick={() => setShowRegionalTeam(value => !value)}>{showRegionalTeam ? "عرض فريق قطر" : "شوف الباقي"}</Button></div>
    <div className="team-filters">
      <label>الفئة<NativeSelect value={category} onChange={event => setCategory(event.target.value)}><NativeSelectOption value="">كل أعضاء الفريق</NativeSelectOption>{categories.map(value => <NativeSelectOption key={value}>{value}</NativeSelectOption>)}</NativeSelect></label>
      <label>مجال الممارسة<NativeSelect value={practice} onChange={event => setPractice(event.target.value)}><NativeSelectOption value="">كل المجالات</NativeSelectOption>{practices.map(value => <NativeSelectOption key={value}>{value}</NativeSelectOption>)}</NativeSelect></label>
      {(category || practice) && <button type="button" onClick={() => { setCategory(""); setPractice(""); }}>إلغاء الفلاتر</button>}
    </div>
    <p className="team-results" role="status">{people.length} عضوًا</p>
    {people.length ? <div className="compact-team-grid">{people.map(member => <TeamCard key={member.slug} member={member} />)}</div> : <div className="team-empty"><p>لا يوجد أعضاء مطابقون للفلاتر المحددة.</p><button className="button button-gold" onClick={() => { setCategory(""); setPractice(""); }}>عرض كل الفريق</button></div>}
  </>;
}
