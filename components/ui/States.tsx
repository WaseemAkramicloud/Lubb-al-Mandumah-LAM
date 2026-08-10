// Loading, Empty, and Error state components

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="lam-state" role="status" aria-live="polite" aria-label={message}>
      <div
        style={{
          width: "2.5rem",
          height: "2.5rem",
          border: "2px solid var(--lam-border-light)",
          borderTopColor: "var(--lam-gold)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
        aria-hidden="true"
      />
      <p className="lam-state__message">{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function EmptyState({
  icon = "○",
  title = "Nothing here yet",
  message,
  action,
}: {
  icon?: string;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="lam-state" role="status">
      <span className="lam-state__icon" aria-hidden="true">{icon}</span>
      <h3 className="lam-state__title">{title}</h3>
      {message && <p className="lam-state__message">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="lam-state" role="alert">
      <span className="lam-state__icon" aria-hidden="true" style={{ color: "#e0896a" }}>⚠</span>
      <h3 className="lam-state__title">{title}</h3>
      {message && <p className="lam-state__message">{message}</p>}
      {onRetry && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={onRetry}
          style={{ marginTop: "0.5rem" }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

// re-export React so callers of EmptyState can use React.ReactNode
import React from "react";
