"use client";

import {
  EducationItem,
  ExperienceItem,
  ProfileCompleteness,
  UserProfile,
} from "@/types";
import { apiClient, getAuthToken, getUser, setUser } from "@/utils/api";
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  GraduationCap,
  Loader2,
  Save,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

const emptyProfile: UserProfile = {
  headline: "",
  bio: "",
  phone: "",
  location: "",
  skills: [],
  linkedIn: "",
  github: "",
  portfolio: "",
  resumeUrl: "",
  experience: [],
  education: [],
};

function emptyExperience(): ExperienceItem {
  return {
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

function emptyEducation(): EducationItem {
  return {
    school: "",
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
    current: false,
    description: "",
  };
}

function mapExperience(raw: unknown): ExperienceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    if (!row || typeof row !== "object") return emptyExperience();
    const o = row as Record<string, unknown>;
    return {
      _id: typeof o._id === "string" ? o._id : undefined,
      title: String(o.title ?? ""),
      company: String(o.company ?? ""),
      location: String(o.location ?? ""),
      startDate: String(o.startDate ?? ""),
      endDate: String(o.endDate ?? ""),
      current: o.current === true,
      description: String(o.description ?? ""),
    };
  });
}

function mapEducation(raw: unknown): EducationItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    if (!row || typeof row !== "object") return emptyEducation();
    const o = row as Record<string, unknown>;
    return {
      _id: typeof o._id === "string" ? o._id : undefined,
      school: String(o.school ?? ""),
      degree: String(o.degree ?? ""),
      field: String(o.field ?? ""),
      startYear: String(o.startYear ?? ""),
      endYear: String(o.endYear ?? ""),
      current: o.current === true,
      description: String(o.description ?? ""),
    };
  });
}

function experiencePayload(rows: ExperienceItem[]) {
  return rows.map((row) => ({
    title: row.title,
    company: row.company,
    location: row.location,
    startDate: row.startDate,
    endDate: row.endDate,
    current: row.current ?? false,
    description: row.description,
  }));
}

function educationPayload(rows: EducationItem[]) {
  return rows.map((row) => ({
    school: row.school,
    degree: row.degree,
    field: row.field,
    startYear: row.startYear,
    endYear: row.endYear,
    current: row.current ?? false,
    description: row.description,
  }));
}

function CompletenessCard({ data }: { data: ProfileCompleteness }) {
  const labels: Record<keyof ProfileCompleteness["sections"], string> = {
    basics: "Contact",
    summary: "Summary",
    skills: "Skills",
    experience: "Experience",
    education: "Education",
    resume: "Résumé",
    links: "Links",
  };

  return (
    <div className="mb-6 rounded-2xl border border-accent/40 bg-gradient-to-br from-accent-muted/90 via-card/80 to-cyan-500/15 p-5 shadow-md shadow-foreground/5 ring-1 ring-border/60 backdrop-blur-sm dark:from-indigo-950/40 dark:via-card/80 dark:to-cyan-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Profile strength</h2>
          <p className="text-sm text-fg-muted">
            Complete your profile to stand out to employers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-card bg-card shadow"
            aria-label={`Profile ${data.percent} percent complete`}
          >
            <span className="text-sm font-bold text-link">{data.percent}%</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(data.sections) as (keyof ProfileCompleteness["sections"])[]).map(
          (key) => (
            <span
              key={key}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                data.sections[key]
                  ? "bg-green-100 text-green-800"
                  : "bg-skeleton text-fg-muted"
              }`}
            >
              {labels[key]}
              {data.sections[key] ? " ✓" : ""}
            </span>
          ),
        )}
      </div>
      {data.missingTips.length > 0 && (
        <ul className="text-sm text-fg-muted space-y-1 list-disc list-inside">
          {data.missingTips.slice(0, 5).map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      const res = await apiClient.getProfile();
      if (!res.success || !res.data) {
        toast.error(res.message || "Could not load profile");
        setLoading(false);
        return;
      }
      const u = res.data;
      setName(u.name);
      setCompleteness(u.profileCompleteness ?? null);
      const p = { ...emptyProfile, ...u.profile };
      setHeadline(p.headline ?? "");
      setBio(p.bio ?? "");
      setPhone(p.phone ?? "");
      setLocation(p.location ?? "");
      setSkillsText((p.skills ?? []).join(", "));
      setLinkedIn(p.linkedIn ?? "");
      setGithub(p.github ?? "");
      setPortfolio(p.portfolio ?? "");
      setExperience(mapExperience(p.experience));
      setEducation(mapEducation(p.education));
      setUser(u);
      setLoading(false);
    };

    void load();
  }, [router]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const role = getUser()?.role;
      const profilePayload: Record<string, unknown> = {
        headline,
        bio,
        phone,
        location,
        linkedIn,
        github,
        portfolio,
      };
      if (role === "jobseeker") {
        profilePayload["skills"] = skills;
        profilePayload["experience"] = experiencePayload(experience);
        profilePayload["education"] = educationPayload(education);
      }

      const res = await apiClient.updateProfile({
        name,
        profile: profilePayload,
      });
      if (!res.success || !res.data) {
        toast.error(res.message || "Save failed");
        return;
      }
      setUser(res.data);
      setCompleteness(res.data.profileCompleteness ?? null);
      toast.success("Profile saved");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const role = getUser()?.role;

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="bg-gradient-to-r from-foreground to-indigo-600 dark:to-indigo-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
            Your profile
          </h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/jobs" className="font-medium text-accent hover:text-link">
              Browse jobs
            </Link>
            {role === "jobseeker" && (
              <Link href="/profile/resume" className="text-accent hover:text-link">
                Résumé →
              </Link>
            )}
          </div>
        </div>

        {role === "jobseeker" && completeness && (
          <CompletenessCard data={completeness} />
        )}

        <form onSubmit={onSave} className="space-y-6">
          <section className="bg-card shadow rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold border-b pb-2">
              <UserIcon className="h-5 w-5 text-accent" />
              Basics
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border-strong rounded-md px-3 py-2"
                required
                minLength={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-muted mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-border-strong rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-muted mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-border-strong rounded-md px-3 py-2"
                />
              </div>
            </div>
          </section>

          <section className="bg-card shadow rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold border-b pb-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Professional summary
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">
                Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Full-stack Engineer"
                className="w-full border border-border-strong rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Describe your background, strengths, and what you are looking for."
                className="w-full border border-border-strong rounded-md px-3 py-2"
              />
            </div>
          </section>

          {role === "jobseeker" && (
            <>
              <section className="bg-card shadow rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 text-foreground font-semibold border-b pb-2">
                  <Briefcase className="h-5 w-5 text-accent" />
                  Skills
                </div>
                <div>
                  <label className="block text-sm font-medium text-fg-muted mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full border border-border-strong rounded-md px-3 py-2"
                  />
                </div>
              </section>

              <section className="bg-card shadow rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Briefcase className="h-5 w-5 text-accent" />
                    Experience
                  </div>
                  <button
                    type="button"
                    onClick={() => setExperience((prev) => [...prev, emptyExperience()])}
                    className="text-sm font-medium text-accent hover:text-link"
                  >
                    + Add role
                  </button>
                </div>
                {experience.length === 0 ? (
                  <p className="text-sm text-fg-subtle">
                    No roles yet. Add your most recent positions.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {experience.map((row, index) => (
                      <div
                        key={row._id ?? `exp-${index}`}
                        className="border border-border rounded-md p-4 space-y-3"
                      >
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setExperience((prev) => prev.filter((_, i) => i !== index))
                            }
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-fg-muted mb-1">
                              Title
                            </label>
                            <input
                              value={row.title}
                              onChange={(e) =>
                                setExperience((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, title: e.target.value } : r,
                                  ),
                                )
                              }
                              className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-fg-muted mb-1">
                              Company
                            </label>
                            <input
                              value={row.company}
                              onChange={(e) =>
                                setExperience((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, company: e.target.value } : r,
                                  ),
                                )
                              }
                              className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-fg-muted mb-1">
                            Location
                          </label>
                          <input
                            value={row.location}
                            onChange={(e) =>
                              setExperience((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, location: e.target.value } : r,
                                ),
                              )
                            }
                            className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-fg-muted mb-1">
                              Start
                            </label>
                            <input
                              value={row.startDate}
                              onChange={(e) =>
                                setExperience((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, startDate: e.target.value } : r,
                                  ),
                                )
                              }
                              placeholder="e.g. Jan 2022"
                              className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-fg-muted mb-1">
                              End
                            </label>
                            <input
                              value={row.endDate}
                              onChange={(e) =>
                                setExperience((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, endDate: e.target.value } : r,
                                  ),
                                )
                              }
                              disabled={row.current}
                              placeholder="e.g. Present"
                              className="w-full border border-border-strong rounded-md px-3 py-2 text-sm disabled:bg-card-muted"
                            />
                          </div>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-fg-muted">
                          <input
                            type="checkbox"
                            checked={row.current ?? false}
                            onChange={(e) =>
                              setExperience((prev) =>
                                prev.map((r, i) =>
                                  i === index
                                    ? { ...r, current: e.target.checked, endDate: "" }
                                    : r,
                                ),
                              )
                            }
                          />
                          I currently work here
                        </label>
                        <div>
                          <label className="block text-xs font-medium text-fg-muted mb-1">
                            Description
                          </label>
                          <textarea
                            value={row.description}
                            onChange={(e) =>
                              setExperience((prev) =>
                                prev.map((r, i) =>
                                  i === index
                                    ? { ...r, description: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            rows={3}
                            className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-card shadow rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <GraduationCap className="h-5 w-5 text-accent" />
                    Education
                  </div>
                  <button
                    type="button"
                    onClick={() => setEducation((prev) => [...prev, emptyEducation()])}
                    className="text-sm font-medium text-accent hover:text-link"
                  >
                    + Add school
                  </button>
                </div>
                {education.length === 0 ? (
                  <p className="text-sm text-fg-subtle">
                    Add degrees or certifications you want recruiters to see.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {education.map((row, index) => (
                      <div
                        key={row._id ?? `edu-${index}`}
                        className="border border-border rounded-md p-4 space-y-3"
                      >
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setEducation((prev) => prev.filter((_, i) => i !== index))
                            }
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-fg-muted mb-1">
                              School
                            </label>
                            <input
                              value={row.school}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, school: e.target.value } : r,
                                  ),
                                )
                              }
                              className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-fg-muted mb-1">
                              Degree
                            </label>
                            <input
                              value={row.degree}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, degree: e.target.value } : r,
                                  ),
                                )
                              }
                              className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-fg-muted mb-1">
                            Field of study
                          </label>
                          <input
                            value={row.field}
                            onChange={(e) =>
                              setEducation((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, field: e.target.value } : r,
                                ),
                              )
                            }
                            className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-fg-muted mb-1">
                              Start year
                            </label>
                            <input
                              value={row.startYear}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, startYear: e.target.value } : r,
                                  ),
                                )
                              }
                              className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-fg-muted mb-1">
                              End year
                            </label>
                            <input
                              value={row.endYear}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, endYear: e.target.value } : r,
                                  ),
                                )
                              }
                              disabled={row.current}
                              className="w-full border border-border-strong rounded-md px-3 py-2 text-sm disabled:bg-card-muted"
                            />
                          </div>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-fg-muted">
                          <input
                            type="checkbox"
                            checked={row.current ?? false}
                            onChange={(e) =>
                              setEducation((prev) =>
                                prev.map((r, i) =>
                                  i === index
                                    ? { ...r, current: e.target.checked, endYear: "" }
                                    : r,
                                ),
                              )
                            }
                          />
                          Currently enrolled
                        </label>
                        <div>
                          <label className="block text-xs font-medium text-fg-muted mb-1">
                            Notes
                          </label>
                          <textarea
                            value={row.description}
                            onChange={(e) =>
                              setEducation((prev) =>
                                prev.map((r, i) =>
                                  i === index
                                    ? { ...r, description: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            rows={2}
                            className="w-full border border-border-strong rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <section className="bg-card shadow rounded-lg p-6 space-y-3">
            <p className="text-foreground font-semibold border-b pb-2">Links</p>
            <input
              type="url"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              placeholder="LinkedIn URL"
              className="w-full border border-border-strong rounded-md px-3 py-2"
            />
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="GitHub URL"
              className="w-full border border-border-strong rounded-md px-3 py-2"
            />
            <input
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="Portfolio URL"
              className="w-full border border-border-strong rounded-md px-3 py-2"
            />
          </section>

          <div className="flex items-center gap-2 text-amber-700 text-sm px-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Email and role cannot be changed here.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}
