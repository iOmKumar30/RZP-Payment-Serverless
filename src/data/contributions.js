export const donationPurposes = [
  "Membership",
  "Sahaaj Pathshala",
  "Sahaaj Poshan",
  "Environment",
  "Empowerment",
  "Education aids",
  "Corpus",
];

export const sponsorships = [
  { title: "One Sahaaj Pathshala student", amount: 3000, detail: "per year" },
  { title: "One Sahaaj Pathshala tutor", amount: 30000, detail: "per year" },
  { title: "One Sahaaj Pathshala", amount: 45000, detail: "per year" },
  { title: "Training of tutors", amount: 3000, detail: "per tutor for 50 sessions" },
  { title: "One-day feast", amount: 50000, detail: "for 1,000 students and teachers" },
  { title: "Chola-Gur for one Pathshala", amount: 15000, detail: "per year" },
  { title: "Environment awareness camp", amount: 15000, detail: "for two days" },
  { title: "Online STEM training", amount: 5000, detail: "per day for college students" },
  { title: "Entrepreneurship & management training", amount: 5000, detail: "for a three-hour online session" },
];

export const contributions = [
  { title: "Annual membership", amount: 1500, detail: "per year", reason: "Membership" },
  { title: "Ten-year membership", amount: 12000, detail: "for ten years", reason: "Membership" },
  ...sponsorships.map((item) => ({ ...item, reason: item.title })),
];
