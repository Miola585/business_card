// Edit this file to personalize your e-card. No layout changes are needed.
// Encoding contact values discourages basic source-code email/phone harvesters.
// It is not encryption; the displayed information remains public to visitors.
const decodeContact = (value) => globalThis.atob(value);

export const profile = {
  name: "Olaide Oladele-Kuyoro",
  initials: "OOK",
  // Add your photo to the public folder, then set this to "/your-photo.jpg".
  // Leave it blank to show your initials instead.
  photo: "/profile-photo.svg",
  photoAlt: "Olaide Oladele-Kuyoro",
  role: "Financial Educator & Consultant",
  company: "Financial Services",
  location: "Baltimore, Maryland",
  availability: "Available for consultations",
  headline: "Let’s make your next financial step feel clear.",
  intro:
    "I work with individuals and families to make money feel less overwhelming. Together, we focus on clear education, practical debt strategies, and a plan built around real life.",
  topics: ["Debt management", "Financial planning", "Financial literacy"],
  email: decodeContact("b2xhaWRlb2xhZGVsZWt1eW9yb0BnbWFpbC5jb20="),
  phone: decodeContact("KzEgKDIwMikgNTk0LTA1MjQ="),
  scheduler: "https://calendly.com/olaideoladelekuyoro/30min",
  finLiteracy: "https://zoom.us/meeting/register/tJYtdO2upzguH9UVd8mm0c3vwKvU4qtzNCok#/registration",
  disclaimer:
    "Sessions combine financial education, debt-management strategies, and personalized guidance focused on family wealth-building goals.",
};
