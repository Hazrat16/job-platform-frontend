"use client";

import { UserProfile } from "@/types";
import { apiClient, getAuthToken, getUser, setUser } from "@/utils/api";
import { AlertCircle, Loader2, Save, Upload } from "lucide-react";
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
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

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
      const p = { ...emptyProfile, ...u.profile };
      setHeadline(p.headline ?? "");
      setBio(p.bio ?? "");
      setPhone(p.phone ?? "");
      setLocation(p.location ?? "");
      setSkillsText((p.skills ?? []).join(", "));
      setLinkedIn(p.linkedIn ?? "");
      setGithub(p.github ?? "");
      setPortfolio(p.portfolio ?? "");
      setResumeUrl(p.resumeUrl ?? "");
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
      const res = await apiClient.updateProfile({
        name,
        profile: {
          headline,
          bio,
          phone,
          location,
          skills,
          linkedIn,
          github,
          portfolio,
        },
      });
      if (!res.success || !res.data) {
        toast.error(res.message || "Save failed");
        return;
      }
      setUser(res.data);
      toast.success("Profile saved");
    } finally {
      setSaving(false);
    }
  };

  const onResume = async (file: File | null) => {
    if (!file) return;
    const res = await apiClient.uploadProfileResume(file);
    if (!res.success || !res.data) {
      toast.error(res.message || "Upload failed");
      return;
    }
    setResumeUrl(res.data.resumeUrl);
    setUser(res.data.user);
    toast.success("Resume updated");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const role = getUser()?.role;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
          <Link
            href="/jobs"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Back to jobs
          </Link>
        </div>

        <form
          onSubmit={onSave}
          className="bg-white shadow rounded-lg p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full-stack Engineer"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {role === "jobseeker" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume
                </label>
                {resumeUrl ? (
                  <p className="text-sm text-gray-600 mb-2">
                    Current file:{" "}
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View / download
                    </a>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mb-2">No resume uploaded yet.</p>
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Upload PDF / DOC</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => void onResume(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Links</p>
            <input
              type="url"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              placeholder="LinkedIn URL"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="GitHub URL"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="Portfolio URL"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Email and role cannot be changed here.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
