"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";


const defaultSlides = [
  {
    src: "/images/slider/slider-01-boardroom-logo-wall.jpg",
    alt: "LΛM Boardroom with logo wall",
  },
  {
    src: "/images/slider/slider-02-building-exterior.jpg",
    alt: "LΛM Headquarters exterior",
  },
  {
    src: "/images/slider/slider-03-conference-room.jpg",
    alt: "LΛM Conference Room",
  },
  {
    src: "/images/slider/slider-04-reception-lobby.jpg",
    alt: "LΛM Reception Lobby",
  },
];

export function HeroSlider({ data }: { data?: Record<string, unknown> | null }) {
  const slidesList = data?.slides as Record<string, string>[] | undefined;
  const slides = slidesList?.length ? slidesList : defaultSlides;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: "600px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            transition: "opacity 1.5s ease-in-out",
            zIndex: 0,
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            style={{ objectFit: "cover", objectPosition: "center" }}
            quality={90}
          />
        </div>
      ))}

      {/* Dark Overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--lam-gradient-hero)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="lam-container"
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          paddingTop: "var(--header-height)",
        }}
      >
        <p
          className="lam-eyebrow animate-fade-up"
          style={{ marginBottom: "1.5rem", animationDelay: "0.1s", color: "var(--lam-gold)" }}
        >
          THE ECOSYSTEM DEVELOPERS
        </p>

        <h1
          className="animate-fade-up"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 7vw, 6rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            marginBottom: "1.5rem",
            animationDelay: "0.2s",
          }}
        >
          <span
            style={{
              background: "var(--lam-gradient-gold)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            L<span style={{ fontStyle: "italic" }}>Λ</span>M
          </span>
          <br />
          <span style={{ color: "var(--lam-white)" }}>Lubb al-Mandūmah</span>
        </h1>

        <p
          className="lam-eyebrow animate-fade-up"
          style={{
            fontSize: "var(--text-xl)",
            color: "var(--lam-silver-light)",
            maxWidth: "720px",
            marginInline: "auto",
            marginBottom: "3rem",
            lineHeight: 1.6,
            animationDelay: "0.3s",
            textTransform: "none",
            letterSpacing: "normal"
          }}
        >
          LΛM is the parent technology company behind an expanding ecosystem of business software, SaaS, platforms and applications.
        </p>

        <div
          className="animate-fade-up"
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            animationDelay: "0.4s",
          }}
        >
          <Link href="/products" className="btn btn-primary btn-lg">
            Explore Products
          </Link>
          <Link href="/request-demo" className="btn btn-secondary btn-lg">
            Request Demo
          </Link>
        </div>
      </div>

      {/* Slide Indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "3rem",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          zIndex: 2,
        }}
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            style={{
              width: "2.5rem",
              height: "3px",
              background: index === current ? "var(--lam-gold)" : "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              transition: "background var(--transition-fast)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
