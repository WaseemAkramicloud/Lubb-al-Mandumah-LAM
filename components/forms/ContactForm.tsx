"use client";

import { useState } from "react";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { submitContactRequest } from "@/lib/actions/forms";

export function ContactForm() {
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

    const result = await submitContactRequest(formData);
    
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
          title="Message Received"
          message="Thank you for reaching out to LΛM. Your enquiry has been securely routed to the appropriate department. We will respond shortly."
        />
        <button className="btn btn-secondary" onClick={() => setIsSuccess(false)} style={{ marginTop: "2rem" }}>
          Send Another Message
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
          <LoadingState message="Securely routing your message..." />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="name" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Full Name *</label>
          <input id="name" name="name" type="text" required className="lam-input" placeholder="e.g. Jane Doe" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="email" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Work Email *</label>
          <input id="email" name="email" type="email" required className="lam-input" placeholder="jane@company.com" />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="type" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Enquiry Type *</label>
        <select id="type" name="type" required className="lam-input" defaultValue="">
          <option value="" disabled>Select an option...</option>
          <option value="general">General Inquiry</option>
          <option value="product">Product Inquiry</option>
          <option value="demo">Request Demo</option>
          <option value="pricing">Pricing / Quotation</option>
          <option value="partnership">Partnership</option>
          <option value="institutional">Institutional Inquiry</option>
          <option value="careers">Careers</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="message" style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver-light)", fontWeight: 500 }}>Message *</label>
        <textarea id="message" name="message" required className="lam-input" rows={5} placeholder="How can we help you?" />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginTop: "0.5rem" }}>
        <input type="checkbox" id="consent" required style={{ marginTop: "0.25rem" }} />
        <label htmlFor="consent" style={{ fontSize: "var(--text-xs)", color: "var(--lam-silver)", lineHeight: 1.5 }}>
          I consent to LΛM processing my personal data in accordance with the Privacy Policy for the purpose of handling this enquiry.
        </label>
      </div>

      {errorMsg && (
        <div style={{ background: "rgba(224, 137, 106, 0.1)", border: "1px solid #e0896a", color: "#e0896a", padding: "1rem", borderRadius: "var(--radius-md)" }}>
          {errorMsg}
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem", alignSelf: "flex-start" }} disabled={isSubmitting}>
        Submit Enquiry
      </button>

      {/* Global input styles specifically for forms if not already in globals.css */}
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
