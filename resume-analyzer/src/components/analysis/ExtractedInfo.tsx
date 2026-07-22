"use client";

import { User, Mail, Phone, MapPin, ExternalLink, Link2, Globe, GraduationCap, Briefcase, FolderKanban, Wrench, Award, Languages as LanguagesIcon, Trophy } from "lucide-react";
import type { ExtractedInfo } from "@/lib/types/resume";

interface ExtractedInfoProps {
  info: ExtractedInfo;
}

export function ExtractedInfoSection({ info }: ExtractedInfoProps) {
  const { personalInfo, summary, education, experience, projects, skills, certifications, achievements, languages } = info;

  const contactItems = [
    { icon: User, label: "Name", value: personalInfo.name },
    { icon: Mail, label: "Email", value: personalInfo.email },
    { icon: Phone, label: "Phone", value: personalInfo.phone },
    { icon: MapPin, label: "Location", value: personalInfo.location },
    { icon: ExternalLink, label: "LinkedIn", value: personalInfo.linkedin },
    { icon: Link2, label: "GitHub", value: personalInfo.github },
    { icon: Globe, label: "Portfolio", value: personalInfo.portfolio },
  ].filter((item) => item.value);

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {contactItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="truncate">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {summary && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Professional Summary</h3>
          <p className="text-sm">{summary}</p>
        </div>
      )}

      {education.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Education ({education.length})
          </h3>
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                <p className="text-muted-foreground text-xs">{edu.institution} {edu.startDate && `| ${edu.startDate} - ${edu.endDate || "Present"}`}</p>
                {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {experience.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Experience ({experience.length})
          </h3>
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{exp.title} at {exp.company}</p>
                <p className="text-muted-foreground text-xs">{exp.startDate} - {exp.endDate || "Present"} {exp.location && `| ${exp.location}`}</p>
                <ul className="mt-1 space-y-0.5">
                  {exp.bullets.slice(0, 3).map((b, j) => (
                    <li key={j} className="text-xs text-muted-foreground/70 ml-3">- {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <FolderKanban className="w-4 h-4" /> Projects ({projects.length})
          </h3>
          <div className="space-y-2">
            {projects.map((proj, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{proj.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{proj.description}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.slice(0, 5).map((t, j) => (
                      <span key={j} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground/70">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(skills.technical.length > 0 || skills.frameworks.length > 0 || skills.tools.length > 0) && (
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Skills
            </h3>
            <div className="space-y-1.5">
              {skills.technical.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground/50 mb-1">Technical</p>
                  <div className="flex flex-wrap gap-1">{skills.technical.map((s, i) => <span key={i} className="text-xs px-2 py-0.5 rounded bg-accent-muted text-accent">{s}</span>)}</div>
                </div>
              )}
              {skills.frameworks.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground/50 mb-1">Frameworks</p>
                  <div className="flex flex-wrap gap-1">{skills.frameworks.map((s, i) => <span key={i} className="text-xs px-2 py-0.5 rounded bg-info-muted text-info">{s}</span>)}</div>
                </div>
              )}
              {skills.tools.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground/50 mb-1">Tools</p>
                  <div className="flex flex-wrap gap-1">{skills.tools.map((s, i) => <span key={i} className="text-xs px-2 py-0.5 rounded bg-warning-muted text-warning">{s}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {certifications.length > 0 && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" /> Certifications ({certifications.length})
              </h3>
              <ul className="space-y-1">{certifications.map((c, i) => <li key={i} className="text-xs text-muted-foreground">- {c}</li>)}</ul>
            </div>
          )}
          {achievements.length > 0 && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Achievements ({achievements.length})
              </h3>
              <ul className="space-y-1">{achievements.map((a, i) => <li key={i} className="text-xs text-muted-foreground">- {a}</li>)}</ul>
            </div>
          )}
          {languages.length > 0 && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <LanguagesIcon className="w-4 h-4" /> Languages
              </h3>
              <div className="flex flex-wrap gap-1">{languages.map((l, i) => <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground">{l}</span>)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
