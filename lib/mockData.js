import { formatShortDate } from "./formatDate";

export const currentUser = {
  name: "Sunny Tan",
  email: "sunny.tan@solarco.com",
  initials: "ST",
};

export const referralSources = [
  "Roadshow - Midvalley",
  "Roadshow - Sutera Mall",
  "Customer Referral",
  "Company Lead - from FB",
  "Natural Market",
];

const rawLeads = [
  {
    id: 1,
    name: "Aisyah Rahman",
    phone: "012-345 6789",
    source: "Roadshow - Midvalley",
    status: "New Lead",
    createdAt: "2026-09-22T09:30:00",
    lastActivity: "2h ago",
    address: "No 12, Jalan Aman 3, Taman Aman, 43000 Kajang, Selangor",
    package: [
      { qty: 15, type: "Panel", desc: "650W JinkoSolar TIGER NEO 3.0 N-Type TOPCon" },
      { qty: 1, type: "Inverter", desc: "[1P] SAJ H2 6KW Single Phase Hybrid" },
    ],
    totalPrice: 32000,
    paymentReceived: 5000,
  },
  {
    id: 2,
    name: "Muthu Kumar",
    phone: "016-789 1234",
    source: "Company Lead - from FB",
    status: "Contacted",
    createdAt: "2026-09-20T14:10:00",
    lastActivity: "1d ago",
  },
  {
    id: 3,
    name: "Lee Wei Jian",
    phone: "019-222 3344",
    source: "Customer Referral",
    status: "Cancelled",
    createdAt: "2026-09-15T11:00:00",
    lastActivity: "3d ago",
  },
  {
    id: 4,
    name: "Nurul Huda",
    phone: "017-555 7788",
    source: "Roadshow - Sutera Mall",
    status: "Pending Confirmation",
    createdAt: "2026-09-19T16:45:00",
    lastActivity: "5h ago",
  },
  {
    id: 5,
    name: "Siti Zainab",
    phone: "013-888 9900",
    source: "Natural Market",
    status: "Confirmed",
    createdAt: "2026-09-17T10:20:00",
    lastActivity: "6h ago",
  },
  {
    id: 6,
    name: "Raj Patel",
    phone: "011-444 2211",
    source: "Roadshow - Midvalley",
    status: "Appointment Scheduled",
    createdAt: "2026-09-21T13:00:00",
    lastActivity: "30m ago",
  },
  {
    id: 7,
    name: "Chong Mei Ling",
    phone: "014-777 6655",
    source: "Customer Referral",
    status: "Completed",
    createdAt: "2026-09-12T09:15:00",
    lastActivity: "2d ago",
  },
  {
    id: 8,
    name: "Farhan Idris",
    phone: "018-333 1122",
    source: "Company Lead - from FB",
    status: "Not Interested",
    createdAt: "2026-09-10T15:30:00",
    lastActivity: "4d ago",
  },
  {
    id: 9,
    name: "Wong Li Ting",
    phone: "015-222 9988",
    source: "Roadshow - Sutera Mall",
    status: "Awaiting Response",
    createdAt: "2026-09-21T11:40:00",
    lastActivity: "8h ago",
  },
  {
    id: 10,
    name: "Devi Shankar",
    phone: "012-111 4455",
    source: "Natural Market",
    status: "No Response",
    createdAt: "2026-09-08T10:05:00",
    lastActivity: "5d ago",
  },
  {
    id: 11,
    name: "Ahmad Zulkifli",
    phone: "019-666 7733",
    source: "Roadshow - Midvalley",
    status: "Proposal/Quotation Sent",
    createdAt: "2026-09-18T17:20:00",
    lastActivity: "1d ago",
  },
  {
    id: 12,
    name: "Farah Aziz",
    phone: "017-999 2244",
    source: "Customer Referral",
    status: "On Hold",
    createdAt: "2026-09-05T12:00:00",
    lastActivity: "6d ago",
  },
  {
    id: 13,
    name: "Aliah",
    phone: "019-234 5566",
    source: "Roadshow - Midvalley",
    status: "Appointment Scheduled",
    createdAt: "2026-09-22T15:00:00",
    lastActivity: "1d ago",
  },
  {
    id: 14,
    name: "Ravi Chandran",
    phone: "016-887 2233",
    source: "Company Lead - from FB",
    status: "Appointment Scheduled",
    createdAt: "2026-09-20T09:00:00",
    lastActivity: "2d ago",
  },
];

export const initialLeads = rawLeads.map((lead) => ({
  ...lead,
  activity: [
    {
      icon: "UserPlus",
      text: `Lead created via ${lead.source}`,
      when: formatShortDate(lead.createdAt),
    },
  ],
}));

export const initialUrgent = [
  { id: 101, leadId: 1, name: "Aisyah Rahman", status: "New Lead", wait: "3h 20m" },
  { id: 102, leadId: 6, name: "Raj Patel", status: "Appointment Scheduled", wait: "2h 05m" },
];

export const initialReminder = [
  { id: 201, leadId: 9, name: "Wong Li Ting", status: "Awaiting Response", wait: "1d 4h" },
  { id: 202, leadId: 10, name: "Devi Shankar", status: "No Response", wait: "5d" },
];

export const siteVisits = [
  { id: 301, leadId: 13, name: "Aliah", when: "15 Sep, 3:00pm" },
  { id: 302, leadId: 14, name: "Ravi Chandran", when: "16 Sep, 10:00am" },
  { id: 303, leadId: 12, name: "Farah Aziz", when: "18 Sep, 2:30pm" },
];
