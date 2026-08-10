"use client";

import { useState } from "react";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { submitDemoRequest } from "@/lib/actions/forms";

export function RequestDemoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    
    const formData = new FormData(e.currentTarget);
    const checked = (document.getElementById("consent") as HTMLInputElement).checked;
    formData.append("consent", checked ? "true" : "false");

    const result = await submitDemoRequest(formData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setIsSuccess(true);
    } else {
      setErrorMsg(result.error || "An error occurred. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div style={{ padding: "4rem 2rem", background: "var(--lam-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--lam-border)", textAlign: "center" }}>
        <EmptyState 
          icon="✓"
          title="Demo Request Received"
          message="Thank you for your interest in LΛM platforms. A product specialist will be in touch shortly to schedule your personalized demonstration."
        />
        <button className="btn btn-secondary" onClick={() => setIsSuccess(false)} style={{ marginTop: "2rem" }}>
          Request Another Demo
        </button>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        background: "var(--lam-surface)",
        padding: "3rem",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--lam-border)",
        position: "relative"
      }}
    >
      {isSubmitting && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(13,13,13,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, borderRadius: "inherit" }}>
          <LoadingState message="Processing request..." />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="name" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Full Name *</label>
          <input id="name" name="name" type="text" required className="lam-input" placeholder="e.g. Jane Doe" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="company" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Company / Institution *</label>
          <input id="company" name="company" type="text" required className="lam-input" placeholder="Organization Name" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="email" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Work Email *</label>
          <input id="email" name="email" type="email" required className="lam-input" placeholder="jane@company.com" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="phone" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Phone (Optional)</label>
          <input id="phone" name="phone" type="tel" className="lam-input" placeholder="+1 234 567 8900" />
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="country" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Country *</label>
          <input id="country" name="country" type="text" required className="lam-input" placeholder="e.g. United Kingdom" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="size" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Company Size (Optional)</label>
          <select id="size" name="size" className="lam-input" defaultValue="">
            <option value="" disabled>Select...</option>
            <option value="1-50">1-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="product" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Product of Interest *</label>
        <select id="product" name="product" required className="lam-input" defaultValue="">
          <option value="" disabled>Select a platform...</option>
          <option value="atom">ATOM (Enterprise Management)</option>
          <option value="aimhighserp">AimHighSERP (Specialized B2B SaaS)</option>
          <option value="maams">MAAMS (Institutional Governance)</option>
          <option value="other">General / Ecosystem Overview</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="requirements" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Key Requirements / Message *</label>
        <textarea id="requirements" name="requirements" required className="lam-input" rows={4} placeholder="Briefly describe your use case or challenges..." />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginTop: "0.5rem" }}>
        <input type="checkbox" id="consent" required style={{ marginTop: "0.25rem" }} />
        <label htmlFor="consent" style={{ fontSize: "var(--text-xs)", color: "var(--lam-silver)", lineHeight: 1.5 }}>
          I consent to LΛM processing my personal data in accordance with the Privacy Policy to facilitate this demonstration request.
        </label>
      </div>

      {errorMsg && (
        <div style={{ background: "rgba(224, 137, 106, 0.1)", border: "1px solid #e0896a", color: "#e0896a", padding: "1rem", borderRadius: "var(--radius-md)" }}>
          {errorMsg}
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem", alignSelf: "flex-start" }} disabled={isSubmitting}>
        Request Demo
      </button>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .lam-input {
            background: var(--lam-black);
            border: 1px solid var(--lam-border);
            color: var(--lam-white);
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            font-family: inherit;
            font-size: var(--text-base);
            transition: border-color 0.2s ease;
          }
          .lam-input:focus {
            outline: none;
            border-color: var(--lam-gold);
          }
        `
      }} />
    </form>
  );
}
