export const STAGE_GROUPS = {
  New: ["New Lead", "Contacted", "Awaiting Response"],
  "In progress": [
    "Follow-Up Required",
    "Interested",
    "Pending Confirmation",
    "Appointment Scheduled",
    "Proposal/Quotation Sent",
    "Negotiation",
  ],
  Won: ["Confirmed", "Completed"],
  Lost: ["Cancelled", "Not Interested"],
  Stalled: ["No Response", "On Hold"],
};

export const STAGE_LABELS = {
  New: "New",
  "In progress": "In progress",
  Won: "Confirmed",
  Lost: "Lost",
  Stalled: "Stalled",
};

export const STATUS_TO_STAGE = Object.fromEntries(
  Object.entries(STAGE_GROUPS).flatMap(([stage, statuses]) =>
    statuses.map((status) => [status, stage])
  )
);

export const STAGE_TO_BUCKET = {
  New: "Active",
  "In progress": "Active",
  Stalled: "Active",
  Won: "Won",
  Lost: "Lost",
};

export const BUCKET_LABELS = {
  all: "All",
  Active: "Active",
  Won: "Confirmed",
  Lost: "Lost",
};

export const STAGE_STYLES = {
  New: "bg-blue-50 text-blue-700",
  "In progress": "bg-amber-50 text-amber-700",
  Won: "bg-green-50 text-green-700",
  Lost: "bg-red-50 text-red-700",
  Stalled: "bg-gray-100 text-gray-500",
};

export function stageOf(status) {
  return STATUS_TO_STAGE[status] || "New";
}

export function bucketOf(status) {
  return STAGE_TO_BUCKET[stageOf(status)];
}
