"use client";

import { useEffect, useRef } from "react";
import { logout } from "@/lib/actions/auth";

export default function AutoLogout({ timeoutMinutes = 15 }: { timeoutMinutes?: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMinutes]);

  return (
    <form ref={formRef} action={logout} style={{ display: "none" }}>
      <button type="submit">Logout</button>
    </form>
  );
}
