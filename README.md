# Agent-CRM

An app to assist agents in managing their leads/customers — tracking follow-up status, referral sources, and site visits, with a click-to-WhatsApp flow for contacting customers.

Built with Next.js (JavaScript, App Router). Agents and leads are stored in a local JSON file (`data/crm.json`, or `CRM_DATA_FILE`). Set `SESSION_SECRET` for sign-in cookies. Targeted for eventual packaging as an Electron desktop app.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010) to view it. (Port 3000 is avoided because another local app on the dev machine uses it.)

## Building

```bash
npm run build
```

A normal build (`npm run build`) is a standard Next.js build. The Netlify preview deploy sets `NEXT_EXPORT=true` (see `netlify.toml`) to produce a static export in `out/`; in that mode only the seeded lead pages exist, so newly added leads won't have detail pages.

## Desktop app (Electron)

Agent CRM can run as a Windows desktop app. It starts its own copy of the server on the PC and shows it in a window; no browser or separate server is needed.

```bash
npm run dist      # builds the app and writes dist/Agent-CRM-Setup-<version>.exe
npm run electron  # runs the desktop shell against the last build (after npm run build)
```

Data lives in `%APPDATA%\Agent CRM\data\crm.json` and the session secret is created on first launch, so reinstalling or updating keeps your leads. While there are no agents, the sign-in page shows a setup form that adds the first one. To add more agents to an installed app:

```bash
set CRM_DATA_FILE=%APPDATA%\Agent CRM\data\crm.json
node scripts/add-agent.mjs "Agent Name" "012-345 6789"
```

## Releasing

Set the new version, commit it, then push a matching tag. GitHub Actions builds the installer and publishes it on the [Releases page](https://github.com/NurulAqilahSaifulBahril/Agent-CRM/releases) with the install notes, the user guide, checksums and the files the app's auto-updater reads.

```bash
npm version 0.2.2 --no-git-tag-version
git tag -a v0.2.2 -m "Agent CRM v0.2.2" && git push origin v0.2.2
```

The [user guide](https://github.com/NurulAqilahSaifulBahril/Agent-CRM/releases/latest/download/Agent-CRM-User-Guide.pdf) is rebuilt for every release. To preview it, run `pip install reportlab` then `python scripts/build_user_guide_pdf.py`; it writes `dist/Agent-CRM-User-Guide.pdf`.
