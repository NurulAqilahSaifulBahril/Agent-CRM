# Agent-CRM

An app to assist agents in managing their leads/customers — tracking follow-up status, referral sources, and site visits, with a click-to-WhatsApp flow for contacting customers.

Built with Next.js (JavaScript, App Router). Currently uses in-memory mock data; a Postgres-backed API is planned. Targeted for eventual packaging as an Electron desktop app.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Building

```bash
npm run build
```

This produces a static export in `out/` (configured via `output: "export"` in `next.config.mjs`).
