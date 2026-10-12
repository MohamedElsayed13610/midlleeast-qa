"use client";

import { teamImageSources } from "@/lib/cms-types";
import type { PublicTeamMember } from "@/lib/cms-types";

const englishTeamCopy: Record<string, { name: string; role: string }> = {
  "omar-saqr": { name: "Omar Saqr", role: "Head of Partnerships & Business Development" },
  "noha-mahmoud": { name: "Noha Mahmoud", role: "Lawyer" },
  "khaled-abdel-wahab": { name: "Khaled Abdel Wahab", role: "Legal Assistant" },
  "zaher-ghraizi": { name: "Zaher Ghraizi", role: "International Lawyer" },
  "linda-ghraizi": { name: "Linda Ghraizi", role: "Lawyer" },
  "dina-abou-zour": { name: "Dina Ali Abou Zour", role: "Lawyer" },
  "elsa-bou-hadir": { name: "Elsa Bou Hadir", role: "Lawyer" },
  "dolsa-el-kharrat": { name: "Dolsa El Kharrat", role: "Lawyer" },
  "houssam-al-hakim": { name: "Houssam Al Hakim", role: "Lawyer" },
  "viviane-mrad": { name: "Viviane Mrad", role: "Lawyer" },
  "bahaa-al-bashir": { name: "Bahaa Al Bashir", role: "Lawyer" },
  "lynne-zebianne": { name: "Lynne Zebianne", role: "Lawyer" },
  "mira-abed-al-khalek": { name: "Mira Abed Al Khalek", role: "Lawyer" },
  "yasmine-nasr": { name: "Yasmine Nasr", role: "Legal Researcher" },
  "iman-abd-al-aziz": { name: "Iman Abd Al Aziz", role: "Lawyer" },
  "abu-bakr-othman": { name: "Abu Bakr Othman", role: "Public Relations Officer" },
  "abdel-hamid-al-sharbini": { name: "Abdel Hamid Al Sharbini", role: "Public Relations Officer" },
  "mohammed-essam-qabawa": { name: "Mohammed Essam Qabawa", role: "Lawyer" },
  "mahmoud-abdel-aziz": { name: "Mahmoud Abdel Aziz", role: "Lawyer" },
  "mohammad-arafat": { name: "Mohammad Arafat", role: "Lawyer" },
};

function fallbackName(member: PublicTeamMember) {
  return member.slug.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default function TeamCardEn({ member }: { member: PublicTeamMember }) {
  const copy = englishTeamCopy[member.slug] ?? { name: fallbackName(member), role: "Legal Professional" };

  return (
    <details
      className="compact-team-card compact-team-details"
      onPointerEnter={event => { if (event.pointerType === "mouse") event.currentTarget.open = true; }}
      onPointerLeave={event => { if (event.pointerType === "mouse") event.currentTarget.open = false; }}
    >
      <summary aria-label={`Profile and experience of ${copy.name}`}>
        <div className="compact-team-visual">
          <img
            src={member.image}
            alt={copy.name}
            width={member.width}
            height={member.height}
            loading="lazy"
            decoding="async"
            srcSet={teamImageSources(member)}
            sizes="(max-width: 760px) 43vw, (max-width: 1100px) 40vw, 27vw"
          />
        </div>
        <div className="compact-team-copy">
          <h3>{copy.name}</h3>
          <p>{copy.role}</p>
          <span className="team-detail-hint">View profile</span>
        </div>
      </summary>
      <div className="compact-bio-overlay">
        <span>{copy.role}</span>
        <h4>{copy.name}</h4>
        <p>Part of the firm's regional team, supporting client matters with focused legal and professional experience.</p>
      </div>
    </details>
  );
}
