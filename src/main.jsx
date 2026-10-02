import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { profile } from "./profile";
import "./styles.css";

const icons = {
  arrow: <path d="m9 18 6-6-6-6M4 12h11" />,
  calendar: (
    <>
      <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 13h3v3H8z" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  contact: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M18 8v6m-3-3h6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-4-4 4 4 4-4" />
      <path d="M5 20h14" />
    </>
  ),
  education: (
    <>
      <path d="m3 9 9-5 9 5-9 5-9-5Z" />
      <path d="M7 12v4c3 2 7 2 10 0v-4m4-3v6" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 3c-3.6-1.5-6.5-4.4-8-8l3-2-2-5Z" />,
  share: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.5m-7.6 6.9 7.6 4.5" />
    </>
  ),
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width={size}
    >
      {icons[name]}
    </svg>
  );
}

const contactItems = [
  { icon: "mail", label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  {
    icon: "phone",
    label: "Direct line",
    value: profile.phone,
    href: `tel:${profile.phone.replace(/[^+\d]/g, "")}`,
  },
  {
    icon: "calendar",
    label: "Private consultation",
    value: "Schedule a conversation",
    href: profile.scheduler,
    external: true,
  },
  {
    icon: "education",
    label: "Financial education",
    value: "Join a literacy session",
    href: profile.finLiteracy,
    external: true,
  },
];

function App() {
  const [toast, setToast] = useState("");
  const [showContactPreview, setShowContactPreview] = useState(false);
  const toastTimer = useRef();

  useEffect(() => {
    document.title = `${profile.name} | Digital Business Card`;
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
      title: `${profile.name}, ${profile.role}`,
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
    const url = URL.createObjectURL(new Blob([vCard], { type: "text/vcard;charset=utf-8" }));
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
      <article className="contact-card" aria-label={`${profile.name} contact card`}>
        <header className="hero">
          <div className="hero-topline">
            <span className="eyebrow">{profile.name}</span>
            <button className="icon-button" onClick={shareCard} type="button" aria-label="Share this contact card">
              <Icon name="share" size={19} />
            </button>
          </div>

          <div className="portrait" aria-label={profile.photoAlt}>
            {profile.photo ? (
              <img
                className="portrait-photo"
                src={profile.photo}
                alt={profile.photoAlt}
                onError={(event) => {
                  event.currentTarget.hidden = true;
                  event.currentTarget.nextElementSibling.hidden = false;
                }}
              />
            ) : null}
            <span className="portrait-fallback" hidden={Boolean(profile.photo)}>{profile.initials}</span>
          </div>

          <div className="identity">
            <h1>{profile.headline}</h1>
            <p className="role">{profile.role}</p>
          </div>

          <div className="hero-location">
            <span className="location-copy"><Icon name="pin" size={14} /> {profile.location}</span>
            <span className="available"><i /> {profile.availability}</span>
          </div>
        </header>

        <div className="card-body">
          <section className="intro-card" aria-label="Services">
            <p className="intro">{profile.intro}</p>
            <div className="topic-tags" aria-label="Topics Olaide can help with">
              {profile.topics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          </section>

          <div className="primary-actions">
            <a className="schedule-button" href={profile.scheduler} target="_blank" rel="noreferrer">
              <Icon name="calendar" size={18} /><span>Schedule a conversation</span>
            </a>
            <button className="save-button" onClick={() => setShowContactPreview(true)} type="button">
              <Icon name="download" size={18} /><span>Save contact</span>
            </button>
          </div>

          <div className="section-heading">
            <p className="section-kicker">Contact</p>
            <h2>Let’s connect</h2>
          </div>

          <div className="contact-list">
            {contactItems.map((item) => (
              <a
                className="contact-row"
                href={item.href}
                key={item.label}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <span className="contact-icon"><Icon name={item.icon} size={19} /></span>
                <span className="contact-copy"><small>{item.label}</small><strong>{item.value}</strong></span>
                <span className="row-arrow"><Icon name="arrow" size={18} /></span>
              </a>
            ))}
          </div>

          <aside className="note">
            <span className="note-mark">My promise</span>
            <p>A thoughtful, judgment-free conversation focused on what matters to you.</p>
          </aside>

          <footer className="card-footer">
            <span>{profile.name} · Financial Educator</span>
            <button onClick={shareCard} type="button"><Icon name="share" size={15} /> Share card</button>
          </footer>
        </div>
      </article>

      <p className="disclaimer">{profile.disclaimer}</p>

      {showContactPreview ? (
        <div
          className="contact-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowContactPreview(false);
          }}
        >
          <section className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" aria-describedby="contact-modal-description">
            <button className="modal-close" type="button" aria-label="Close contact preview" onClick={() => setShowContactPreview(false)}>×</button>
            <div className="contact-preview-avatar" aria-hidden="true">{profile.initials}</div>
            <p className="modal-kicker">Contact preview</p>
            <h2 id="contact-modal-title">Add {profile.name}?</h2>
            <p id="contact-modal-description" className="modal-description">
              Your phone will show its contact screen with the details below. You choose whether to save it.
            </p>
            <div className="contact-preview-fields">
              <div className="contact-preview-row"><Icon name="contact" /><span><small>Name</small><strong>{profile.name}</strong></span></div>
              <div className="contact-preview-row"><Icon name="phone" /><span><small>Phone</small><strong>{profile.phone}</strong></span></div>
              <div className="contact-preview-row"><Icon name="mail" /><span><small>Email</small><strong>{profile.email}</strong></span></div>
            </div>
            <p className="modal-privacy-note">Nothing is added unless you approve it on your phone.</p>
            <div className="modal-actions">
              <button className="modal-button modal-button-light" type="button" onClick={() => setShowContactPreview(false)}>Cancel</button>
              <button className="modal-button modal-button-dark" type="button" onClick={saveContact} autoFocus>Continue <Icon name="arrow" size={18} /></button>
            </div>
          </section>
        </div>
      ) : null}

      <div className={`toast ${toast ? "toast-visible" : ""}`} role="status" aria-live="polite">
        <Icon name="check" size={16} /> {toast}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>,
);
