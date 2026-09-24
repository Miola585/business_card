import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { profile } from "./profile";
import "./styles.css";

const icons = {
  arrow: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M18 8v6m-3-3h6" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 9v11M7 5v.01M11 20V9m0 5a4 4 0 0 1 8 0v6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 3.5 10 7.7 7.5 9.2a15 15 0 0 0 7.3 7.3l1.5-2.5 4.2 1.8v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3.2 5.5a2 2 0 0 1 2-2h3Z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.5m-7.6 6.9 7.6 4.5" />
    </svg>
  ),
};

function Icon({ name }) {
  return <span className="icon">{icons[name]}</span>;
}

function App() {
  const [toast, setToast] = useState("");
  const [showContactPreview, setShowContactPreview] = useState(false);
  const toastTimer = useRef();

  useEffect(() => {
    document.title = `${profile.name} — Digital Business Card`;
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!showContactPreview) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowContactPreview(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [showContactPreview]);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  };

  const shareCard = async () => {
    const shareData = {
      title: `${profile.name} — ${profile.role}`,
      text: `Connect with ${profile.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") notify("Unable to open sharing");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Card link copied");
    } catch {
      notify("Copy this page URL to share your card");
    }
  };

  const saveContact = () => {
    const escapeVCardValue = (value) =>
      value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
    const nameParts = profile.name.trim().split(/\s+/);
    const firstName = nameParts.shift() || "";
    const lastName = nameParts.pop() || "";
    const middleNames = nameParts.join(" ");
    const vCard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCardValue(profile.name)}`,
      `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};${escapeVCardValue(middleNames)};;`,
      `TEL;TYPE=CELL:${escapeVCardValue(profile.phone)}`,
      `EMAIL;TYPE=INTERNET:${escapeVCardValue(profile.email)}`,
      "END:VCARD",
    ].join("\r\n");
    const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const isAppleMobile =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    setShowContactPreview(false);

    if (isAppleMobile) {
      window.location.assign(url);
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${profile.name.replace(/\s+/g, "-").toLowerCase()}.vcf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Open the contact card to finish adding it");
  };

  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="Main navigation">
        <button className="share-button" type="button" onClick={shareCard}>
          <Icon name="share" />
          <span>Share card</span>
        </button>
      </nav>

      <section className="hero" id="top">
        <div className="intro-column">
          <div className="eyebrow">
            {profile.availability}
          </div>

          <h1 className={profile.name.length > 18 ? "long-name" : undefined}>
            <span className="greeting">Hi, I’m</span>
            <span className="person-name">{profile.name.replace(/-/g, "‑")}.</span>
          </h1>
          <p className="role-line">
            {profile.role} <i /> {profile.company}
          </p>
          <p className="bio">{profile.bio}</p>

          <div className="primary-actions">
            <button
              className="button button-dark"
              type="button"
              onClick={() => setShowContactPreview(true)}
            >
              <Icon name="contact" />
              Save contact
            </button>
            <a className="button button-light" href={profile.finLiteracy} target="_blank" rel="noreferrer">
              <Icon name="calendar" />
              Financial Literacy Workshops
              <Icon name="arrow" />
            </a>
          </div>

          <div className="location">
            <Icon name="pin" />
            Based in {profile.location}
          </div>
        </div>

        <aside className="contact-card" aria-label="Contact card">
          <div className="portrait">
            {profile.photo ? (
              <img
                className="portrait-photo"
                src={profile.photo}
                alt={profile.photoAlt}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.nextElementSibling.style.display = "grid";
                }}
              />
            ) : null}
            <div
              className="portrait-initials"
              aria-hidden="true"
              style={{ display: profile.photo ? "none" : "grid" }}
            >
              {profile.initials}
            </div>
          </div>

          <div className="card-identity">
            <h2>{profile.name}</h2>
            <p>{profile.role}</p>
          </div>

          <div className="contact-links">
            <a className="contact-row" href={`mailto:${profile.email}`}>
              <span className="row-icon"><Icon name="mail" /></span>
              <span className="row-copy">
                <small>Email</small>
                <strong>{profile.email}</strong>
              </span>
              <Icon name="arrow" />
            </a>

            <a className="contact-row" href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}>
              <span className="row-icon"><Icon name="phone" /></span>
              <span className="row-copy">
                <small>Phone</small>
                <strong>{profile.phone}</strong>
              </span>
              <Icon name="arrow" />
            </a>

            <a className="contact-row" href={profile.linkedin} target="_blank" rel="noreferrer">
              <span className="row-icon"><Icon name="linkedin" /></span>
              <span className="row-copy">
                <small>LinkedIn</small>
                <strong>Connect with me</strong>
              </span>
              <Icon name="arrow" />
            </a>

            <a className="contact-row" href={profile.scheduler} target="_blank" rel="noreferrer">
              <span className="row-icon"><Icon name="calendar" /></span>
              <span className="row-copy">
                <small>Calendar</small>
                <strong>Schedule Free Consultation</strong>
              </span>
              <Icon name="arrow" />
            </a>
          </div>

          <div className="card-footer">
            <span>{profile.company}</span>
          </div>
        </aside>
      </section>

      <p className="disclaimer">{profile.disclaimer}</p>

      <footer>
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Education and guidance for stronger financial futures.</span>
      </footer>

      {showContactPreview ? (
        <div
          className="contact-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowContactPreview(false);
          }}
        >
          <section
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            aria-describedby="contact-modal-description"
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close contact preview"
              onClick={() => setShowContactPreview(false)}
            >
              ×
            </button>

            <div className="contact-preview-avatar" aria-hidden="true">
              {profile.initials}
            </div>
            <p className="modal-kicker">Contact preview</p>
            <h2 id="contact-modal-title">Add {profile.name}?</h2>
            <p id="contact-modal-description" className="modal-description">
              Only the information shown below will be sent to your phone’s contact screen.
            </p>

            <div className="contact-preview-fields">
              <div className="contact-preview-row">
                <Icon name="contact" />
                <span><small>Name</small><strong>{profile.name}</strong></span>
              </div>
              <div className="contact-preview-row">
                <Icon name="phone" />
                <span><small>Phone</small><strong>{profile.phone}</strong></span>
              </div>
              <div className="contact-preview-row">
                <Icon name="mail" />
                <span><small>Email</small><strong>{profile.email}</strong></span>
              </div>
            </div>

            <p className="modal-privacy-note">
              Nothing is added until you approve it on your phone.
            </p>
            <div className="modal-actions">
              <button
                className="button button-light"
                type="button"
                onClick={() => setShowContactPreview(false)}
              >
                Cancel
              </button>
              <button className="button button-dark" type="button" onClick={saveContact} autoFocus>
                Continue to phone contacts
                <Icon name="arrow" />
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <div className={`toast ${toast ? "toast-visible" : ""}`} role="status" aria-live="polite">
        <span>✓</span> {toast}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
