## Agent CRM v{{VERSION}}

**Download for Windows:** Agent-CRM-Setup-{{VERSION}}.exe

### Installing

1. Download **Agent-CRM-Setup-{{VERSION}}.exe** below and open it.
2. Windows may show **"Windows protected your PC"** the first time, because
   the installer is not code-signed yet. Click **More info → Run anyway**.
   This happens once per download.
3. Keep the default install folder or pick another, then finish. Agent CRM
   opens from the Start menu or the desktop shortcut.

The first start takes a few seconds while the app starts its server.

**New here?** Read `Agent-CRM-User-Guide.pdf` below — it walks through
installing, signing in and updating, step by step.

### Signing in

Sign in with the phone number IT registered for you — the installer does not
ask you to create an account. A new install has no agents on it, so ask IT
to add your number before you sign in for the first time.

### Your leads

Leads are saved on this PC in `%APPDATA%\Agent CRM\data`, not in the install
folder. Updating or reinstalling keeps them, and uninstalling does not delete
them. Each PC keeps its own leads; they are not shared between computers.

### Updating

Existing users: auto-update is enabled. The app checks for a new version every
few hours, downloads it in the background and asks to restart. Choose
**Later** and it installs when you close the app.

---

`SHA256SUMS.txt` lists a checksum for each file. `latest.yml` and the
`.blockmap` are read by the app's updater; you do not need to download them.
