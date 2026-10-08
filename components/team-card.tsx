"use client";

import type { TeamMember } from "@/lib/team";

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <details className="compact-team-card compact-team-details"
      onPointerEnter={event => { if (event.pointerType === "mouse") event.currentTarget.open = true; }}
      onPointerLeave={event => { if (event.pointerType === "mouse") event.currentTarget.open = false; }}>
      <summary aria-label={`تفاصيل وخبرات ${member.name}`}>
        <div className="compact-team-visual"><img src={member.image} alt={member.name} loading="lazy" /></div>
        <div className="compact-team-copy"><h3>{member.name}</h3><p>{member.role}</p>{member.practice && <span>{member.practice}</span>}<span className="team-detail-hint">تفاصيل الخبرة</span></div>
      </summary>
      <div className="compact-bio-overlay"><span>{member.role}</span><h4>{member.name}</h4><p>{member.bio}</p>{member.practice && <p className="compact-bio-practice">مجال الممارسة: {member.practice}</p>}</div>
    </details>
  );
}
