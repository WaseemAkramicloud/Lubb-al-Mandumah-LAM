"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface SlideItem {
  src: string;
  alt: string;
  headline?: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
}

const defaultSlides: SlideItem[] = [
  {
    src: "/images/slider/slider-01-boardroom-logo-wall.jpg",
    alt: "LΛM Boardroom with logo wall",
    headline: "Parent Enterprise Infrastructure",
    subline: "Orchestrating interconnected SaaS platforms and business systems across global markets.",
    ctaText: "Explore Products",
    ctaLink: "/products"
  },
  {
    src: "/images/slider/slider-02-building-exterior.jpg",
    alt: "LΛM Headquarters exterior",
    headline: "Global Operational Command",
    subline: "Built for scaling multi-subsidiary enterprise networks with unified oversight.",
    ctaText: "Explore Solutions",
    ctaLink: "/solutions"
  },
  {
    src: "/images/slider/slider-03-conference-room.jpg",
    alt: "LΛM Conference Room",
    headline: "Unified Identity & Governance",
    subline: "Single-plane access control for compliance, security, and corporate administration.",
    ctaText: "Request Walkthrough",
    ctaLink: "/request-demo"
  },
  {
    src: "/images/slider/slider-04-reception-lobby.jpg",
    alt: "LΛM Reception Lobby",
    headline: "Lubb al-Mandūmah",
    subline: "The foundational technology ecosystem powering modern ambitious organizations.",
    ctaText: "About the Ecosystem",
    ctaLink: "/about"
  },
];

export function HeroSlider({ data }: { data?: Record<string, unknown> | null }) {
  const slidesList = data?.slides as SlideItem[] | undefined;
  const slides = slidesList?.length ? slidesList : defaultSlides;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section
      style={{
        position: "relative",
        height: "92vh",
        minHeight: "620px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0F172A",
      }}
    >
      {/* Slider Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          style={{
            position: "absolute",
            inset: 0,
            opacity: index === current ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
            zIndex: 0,
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt || "LΛM Platform Imagery"}
            fill
            priority={index === 0}
            style={{ objectFit: "cover", objectPosition: "center" }}
            quality={90}
          />
        </div>
      ))}

      {/* High-Contrast Backdrop Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.78) 60%, rgba(15,23,42,0.95) 100%)",
          zIndex: 1,
        }}
      />

      {/* Dynamic Slide Content */}
      <div
        className="lam-container"
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          paddingTop: "calc(var(--header-height) + 2rem)",
          maxWidth: "860px",
        }}
      >
        <p
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#38BDF8",
            marginBottom: "1rem",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          Lubb al-Mandūmah — Technology Group
        </p>

        {slides.map((slide, index) => {
          if (index !== current) return null;

          return (
            <div key={index} className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  marginBottom: "1.25rem",
                  textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                }}
              >
                {slide.headline || defaultSlides[index]?.headline || "Lubb al-Mandūmah"}
              </h1>

              <p
                style={{
                  fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                  color: "#F8FAFC",
                  maxWidth: "720px",
                  marginInline: "auto",
                  marginBottom: "2.5rem",
                  lineHeight: 1.65,
                  fontWeight: 500,
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {slide.subline || defaultSlides[index]?.subline || "The foundational technology ecosystem powering modern organizations."}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href={slide.ctaLink || defaultSlides[index]?.ctaLink || "/products"}
                  className="btn btn-lg"
                  style={{
                    background: "#FFFFFF",
                    color: "#0F172A",
                    fontWeight: 700,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {slide.ctaText || defaultSlides[index]?.ctaText || "Explore Ecosystem"} &rarr;
                </Link>
                <Link
                  href="/request-demo"
                  className="btn btn-lg"
                  style={{
                    background: "rgba(15,23,42,0.75)",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255,255,255,0.4)",
                    backdropFilter: "blur(4px)",
                    fontWeight: 600,
                  }}
                >
                  Request Demo
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.6rem",
          zIndex: 2,
        }}
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            style={{
              width: index === current ? "2rem" : "0.5rem",
              height: "0.5rem",
              borderRadius: "4px",
              background: index === current ? "#38BDF8" : "rgba(255,255,255,0.45)",
              border: "none",
              cursor: "pointer",
              transition: "all var(--transition-base)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
