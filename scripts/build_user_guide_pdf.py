"""Generate the Agent CRM install & update guide in the Eternalgy house style.

Same design as the Commission Portal guide: dark cover band, blue accent, one
A4 page. The version comes from package.json, and the release workflow rebuilds
the guide for every tag, so it always names the installer it ships beside.

Run:  pip install reportlab
      python scripts/build_user_guide_pdf.py
Writes dist/Agent-CRM-User-Guide.pdf
"""

from __future__ import annotations

import datetime
import glob
import json
import os
import re

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as _canvas

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "dist", "Agent-CRM-User-Guide.pdf")
LOGO = os.path.join(HERE, "assets", "logo-header.png")

with open(os.path.join(ROOT, "package.json"), encoding="utf-8") as f:
    VERSION = json.load(f)["version"]
INSTALLER = f"Agent-CRM-Setup-{VERSION}.exe"
_today = datetime.date.today()
DATE_LINE = ("January February March April May June July August September "
             "October November December").split()[_today.month - 1] + f" {_today.year}"
RELEASES_URL = "https://github.com/NurulAqilahSaifulBahril/Agent-CRM/releases/latest"

# ── Fonts (Segoe UI + Consolas, as in the Commission guide) ──────────────────
# Office for Mac has no Segoe UI, so Aptos stands in there; the swap is printed
# so it can't happen quietly. Rebuild on Windows for the exact house style.
FONT_DIRS = [
    r"C:\Windows\Fonts",
    "/Library/Fonts",
    os.path.expanduser("~/Library/Fonts"),
] + sorted(glob.glob("/Applications/Microsoft */Contents/Resources/DFonts"))

FONT_CANDIDATES = {
    "SegoeUI": ["segoeui.ttf", "Aptos.ttf"],
    "SegoeUI-Bold": ["segoeuib.ttf", "Aptos-Bold.ttf"],
    "SegoeUI-Italic": ["segoeuii.ttf", "Aptos-Italic.ttf"],
    "SegoeUI-Semibold": ["seguisb.ttf", "Aptos-SemiBold.ttf"],
    "Consolas": ["consola.ttf"],
}


def _register_fonts() -> None:
    chosen: dict[str, str] = {}
    for name, candidates in FONT_CANDIDATES.items():
        for filename in candidates:
            hit = next((os.path.join(d, filename) for d in FONT_DIRS
                        if os.path.isfile(os.path.join(d, filename))), None)
            if hit:
                pdfmetrics.registerFont(TTFont(name, hit))
                chosen[name] = filename
                break
        if name not in chosen:
            raise SystemExit(f"ERROR: no font file found for {name}. Tried "
                             f"{candidates} in {FONT_DIRS}")
    swapped = sorted({chosen[n] for n in chosen if chosen[n] != FONT_CANDIDATES[n][0]})
    if swapped:
        print("NOTE: Segoe UI is not installed here, so the guide was set in "
              + ", ".join(swapped) + ".")


_register_fonts()

# ── Palette (the Commission guide's) ─────────────────────────────────────────
DARK = HexColor("#0f1922")
ACCENT = HexColor("#2563eb")
LIGHT_BLUE = HexColor("#60a5fa")
BADGE_BLUE = HexColor("#93c5fd")
SUBTITLE = HexColor("#aec3de")
TEXT = HexColor("#0f172a")
MUTED = HexColor("#64748b")
NUM_FG = HexColor("#1d4ed8")
CODE_BG = HexColor("#eff2f6")
RULE = HexColor("#dce3ec")
SHADOW = HexColor("#d7dee7")
WHITE = HexColor("#ffffff")
RING = HexColor("#f59e0b")      # "click here" ring on the blue SmartScreen panels

# Windows dialog chrome, for the drawn SmartScreen and update dialogs. Sampled
# to look like what appears on screen, not this document's own palette.
SS_BG = HexColor("#1a5fa6")
SS_SUB = HexColor("#dbe7f5")
OS_BG = HexColor("#f3f3f3")
OS_BORDER = HexColor("#d2d2d6")
OS_TEXT = HexColor("#1c1c1e")
INFO_BLUE = HexColor("#1e6fd9")
INSTRUCTION = HexColor("#1f3a8a")
LINK_ARROW = HexColor("#15803d")

# ── Page geometry (A4) ───────────────────────────────────────────────────────
PAGE_W, PAGE_H = 595.28, 841.89
M = 56.69
RIGHT = 538.58
CW = RIGHT - M
BOTTOM_LIMIT = 780
LEADING = 14.2

# ── Rich text: **bold**  *italic*  `code`  [text](url) ───────────────────────
_TOKEN = re.compile(r"(\*\*.+?\*\*|\*.+?\*|`.+?`|\[.+?\]\(.+?\))")


def _spans(text: str, base_font: str, size: float, color) -> list[tuple]:
    """[(word, font, size, color, is_code, url), ...] split into words."""
    out = []
    for part in _TOKEN.split(text):
        if not part:
            continue
        url = None
        if part.startswith("**") and part.endswith("**"):
            font, s, col, code, raw = "SegoeUI-Bold", size, color, False, part[2:-2]
        elif part.startswith("*") and part.endswith("*"):
            font, s, col, code, raw = "SegoeUI-Italic", size, color, False, part[1:-1]
        elif part.startswith("`") and part.endswith("`"):
            font, s, col, code, raw = "Consolas", size * 0.88, color, True, part[1:-1]
        elif part.startswith("["):
            m = re.match(r"\[(.+?)\]\((.+?)\)", part)
            raw, url = m.group(1), m.group(2)
            font, s, col, code = "SegoeUI-Bold", size, NUM_FG, False
        else:
            font, s, col, code, raw = base_font, size, color, False, part

        if raw.startswith(" ") and out:
            out.append((" ", base_font, size, color, False, None))
        # code stays in one box so a path like "Agent CRM\data" isn't split
        words = [raw] if code else [w for w in raw.split(" ") if w != ""]
        for i, word in enumerate(words):
            if i > 0:
                # a space inside a link keeps the link's underline continuous
                out.append((" ", font, s, col, False, url))
            out.append((word, font, s, col, code, url))
        if raw.endswith(" ") and words:
            out.append((" ", base_font, size, color, False, None))
    return out


def _wrap(text: str, width: float, base_font="SegoeUI", size=10.0, color=TEXT):
    lines, line, w = [], [], 0.0
    for tok in _spans(text, base_font, size, color):
        tw = pdfmetrics.stringWidth(tok[0], tok[1], tok[2]) + (5 if tok[4] else 0)
        if tok[0] == " ":
            line.append(tok); w += tw
            continue
        if line and w + tw > width:
            while line and line[-1][0] == " ":
                line.pop()
            lines.append(line)
            line, w = [], 0.0
        line.append(tok); w += tw
    while line and line[-1][0] == " ":
        line.pop()
    if line:
        lines.append(line)
    return lines


class Guide:
    def __init__(self):
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        self.c = _canvas.Canvas(OUT, pagesize=(PAGE_W, PAGE_H))
        self.c.setTitle("Agent CRM — Install & Update Guide")
        self.c.setAuthor("Eternalgy")
        self.page = 1
        self.y = 0.0
        self._cover_header()

    # top-based y -> pdf y
    def Y(self, y):
        return PAGE_H - y

    # ── headers / footers ────────────────────────────────────────────────────
    def _footer(self):
        c = self.c
        c.setStrokeColor(RULE); c.setLineWidth(0.6)
        c.line(M, self.Y(799.4), RIGHT, self.Y(799.4))
        c.setFont("SegoeUI", 7.6); c.setFillColor(MUTED)
        c.drawString(M, self.Y(812), "Install & Update Guide")
        c.drawRightString(RIGHT, self.Y(812), str(self.page))

    def _cover_header(self):
        c = self.c
        c.setFillColor(DARK)
        c.rect(0, self.Y(153.1), PAGE_W, 153.1, stroke=0, fill=1)
        c.setFillColor(ACCENT)
        c.rect(0, self.Y(156.1), PAGE_W, 3, stroke=0, fill=1)
        if os.path.exists(LOGO):
            c.drawImage(LOGO, M, self.Y(59.1), width=42.5, height=21.7,
                        preserveAspectRatio=True, mask="auto")
        c.setFont("SegoeUI-Bold", 8.5); c.setFillColor(BADGE_BLUE)
        c.drawString(M + 53, self.Y(52.5), "E T E R N A L G Y")
        c.setFont("SegoeUI-Semibold", 25); c.setFillColor(WHITE)
        c.drawString(M, self.Y(90), "Agent CRM")
        c.setFillColor(LIGHT_BLUE)
        c.drawString(M, self.Y(122), "Install & Update Guide")
        c.setFont("SegoeUI", 10); c.setFillColor(SUBTITLE)
        c.drawString(M, self.Y(140.5),
                     f"Lead tracking for solar sales agents  \u00b7  Version {VERSION}"
                     f"  \u00b7  {DATE_LINE}")
        self._footer()
        self.y = 186

    def _cont_header(self):
        c = self.c
        c.setFillColor(DARK)
        c.rect(0, self.Y(23), PAGE_W, 23, stroke=0, fill=1)
        c.setFillColor(ACCENT)
        c.rect(0, self.Y(24), PAGE_W, 1, stroke=0, fill=1)
        c.setFont("SegoeUI-Bold", 8)
        c.setFillColor(BADGE_BLUE); c.drawString(M, self.Y(15.5), "ETERNALGY")
        c.setFillColor(WHITE); c.drawRightString(RIGHT, self.Y(15.5), "AGENT CRM")
        self._footer()
        self.y = 56

    def ensure(self, needed: float):
        if self.y + needed > BOTTOM_LIMIT:
            self.c.showPage()
            self.page += 1
            self._cont_header()

    # ── text ─────────────────────────────────────────────────────────────────
    def _draw_line_tokens(self, tokens, x, baseline_top):
        c = self.c
        by = self.Y(baseline_top)
        for word, font, size, color, is_code, url in tokens:
            w = pdfmetrics.stringWidth(word, font, size)
            if is_code and word.strip():
                c.setFillColor(CODE_BG)
                c.roundRect(x - 0.5, by - 2.4, w + 4, 11.6, 2, stroke=0, fill=1)
                c.setFillColor(TEXT)
                c.setFont(font, size)
                c.drawString(x + 1.5, by, word)
                x += w + 3.5
                continue
            c.setFillColor(color)
            c.setFont(font, size)
            c.drawString(x, by, word)
            if url:
                c.setStrokeColor(color); c.setLineWidth(0.7)
                c.line(x, by - 1.6, x + w, by - 1.6)
                c.linkURL(url, (x, by - 3, x + w, by + size), relative=0)
            x += w

    def para(self, text, size=9.2, leading=11.6, gap=6.0):
        lines = _wrap(text, CW, "SegoeUI", size, TEXT)
        self.ensure(len(lines) * leading + 2)
        for ln in lines:
            self.y += leading
            self._draw_line_tokens(ln, M, self.y - 3)
        self.y += gap

    def rule(self, gap_before=2, gap_after=8):
        self.y += gap_before
        self.c.setStrokeColor(RULE); self.c.setLineWidth(0.7)
        self.c.line(M, self.Y(self.y), RIGHT, self.Y(self.y))
        self.y += gap_after

    def heading(self, text, keep=0):
        """keep = height of the block that must stay on the page with it."""
        self.ensure(24 + keep)
        self.y += 3
        self.c.setFont("SegoeUI-Semibold", 11); self.c.setFillColor(DARK)
        self.c.drawString(M, self.Y(self.y + 11), text)
        self.y += 15

    def _panel_caption(self, top, h, caption, center=PAGE_W / 2):
        self.y = top + h + 14
        for ln in _wrap(caption, CW, "SegoeUI-Italic", 9, MUTED):
            total = sum(pdfmetrics.stringWidth(t[0], t[1], t[2]) for t in ln)
            self.y += 12.5
            self._draw_line_tokens(ln, center - total / 2, self.y - 3)
        self.y += 10

    # ── drawn Windows dialogs ────────────────────────────────────────────────
    # Drawn rather than screenshotted, as in the Commission guide: the wording
    # is what matters, and a mock doesn't go stale with the next Windows theme.
    def _flat_button(self, x, y, w, h, label, ring=False):
        c = self.c
        if ring:
            c.setStrokeColor(RING); c.setLineWidth(1.4)
            c.roundRect(x - 2.5, self.Y(y + h + 2.5), w + 5, h + 5, 4, stroke=1, fill=0)
        c.setStrokeColor(WHITE); c.setLineWidth(0.8)
        c.rect(x, self.Y(y + h), w, h, stroke=1, fill=0)
        c.setFillColor(WHITE); c.setFont("SegoeUI", 7.2)
        c.drawCentredString(x + w / 2, self.Y(y + h / 2 + 2.5), label)

    def _smartscreen_panel(self, x, top, w, expanded):
        c = self.c
        pad = 10.0
        text_w = w - 2 * pad
        body = ("Microsoft Defender SmartScreen prevented an unrecognized app "
                "from starting. Running this app might put your PC at risk.")
        body_lines = _wrap(body, text_w, "SegoeUI", 7.0, SS_SUB)
        details = [f"App:  {INSTALLER}", "Publisher:  Unknown publisher"] if expanded else []
        btn_h = 16.0
        h = (pad + 11 + 4 + len(body_lines) * 9.4 + 4
             + (len(details) * 9.6 if expanded else 12) + 9 + btn_h + pad)
        c.setFillColor(SHADOW)
        c.roundRect(x + 1, self.Y(top + h + 1.5), w, h, 4, stroke=0, fill=1)
        c.setFillColor(SS_BG)
        c.roundRect(x, self.Y(top + h), w, h, 4, stroke=0, fill=1)
        yy = top + pad + 11
        c.setFillColor(WHITE); c.setFont("SegoeUI-Semibold", 11)
        c.drawString(x + pad, self.Y(yy), "Windows protected your PC")
        yy += 4
        for ln in body_lines:
            yy += 9.4
            self._draw_line_tokens(ln, x + pad, yy - 2.2)
        yy += 4
        if expanded:
            for d in details:
                yy += 9.6
                c.setFillColor(WHITE); c.setFont("SegoeUI", 7.0)
                c.drawString(x + pad, self.Y(yy - 2.2), d)
        else:
            yy += 12
            label = "More info"
            lw = pdfmetrics.stringWidth(label, "SegoeUI-Semibold", 7.4)
            by = self.Y(yy - 2.6)
            c.setFillColor(WHITE); c.setFont("SegoeUI-Semibold", 7.4)
            c.drawString(x + pad, by, label)
            c.setStrokeColor(WHITE); c.setLineWidth(0.6)
            c.line(x + pad, by - 1.4, x + pad + lw, by - 1.4)
            c.setStrokeColor(RING); c.setLineWidth(1.4)
            c.roundRect(x + pad - 4, by - 4.5, lw + 8, 14, 4, stroke=1, fill=0)
        btn_top = top + h - pad - btn_h
        bw = 62.0
        if expanded:
            self._flat_button(x + w - pad - 2 * bw - 8, btn_top, bw, btn_h,
                              "Run anyway", ring=True)
        self._flat_button(x + w - pad - bw, btn_top, bw, btn_h, "Don't run")
        return h

    def smartscreen_row(self, caption):
        w, gap = 218.0, 20.0
        x0 = M + (CW - (2 * w + gap)) / 2
        self.ensure(150)
        top = self.y
        h1 = self._smartscreen_panel(x0, top, w, expanded=False)
        h2 = self._smartscreen_panel(x0 + w + gap, top, w, expanded=True)
        self._panel_caption(top, max(h1, h2), caption)

    UPDATE_DETAIL = ("Your leads are kept. If you choose Later, it installs "
                     "when you close the app.")

    @classmethod
    def _update_dialog_size(cls, w):
        pad, bar, link_h = 10.0, 19.0, 16.0
        detail = _wrap(cls.UPDATE_DETAIL, w - 2 * pad - 26, "SegoeUI", 7.4, OS_TEXT)
        return detail, bar + pad + 13 + 4 + len(detail) * 10 + 7 + 2 * link_h + pad

    def _update_dialog(self, x, top, w):
        """Electron's message box as Windows draws it: a task dialog whose
        custom buttons appear as command links."""
        c = self.c
        pad, bar, link_h = 10.0, 19.0, 16.0
        text_x = x + pad + 26
        detail, h = self._update_dialog_size(w)
        c.setFillColor(SHADOW)
        c.roundRect(x + 1.5, self.Y(top + h + 2), w, h, 6, stroke=0, fill=1)
        c.setFillColor(WHITE); c.setStrokeColor(OS_BORDER); c.setLineWidth(0.9)
        c.roundRect(x, self.Y(top + h), w, h, 6, stroke=1, fill=1)
        # title bar
        c.setFillColor(OS_TEXT); c.setFont("SegoeUI", 7.6)
        c.drawString(x + pad, self.Y(top + 12.5), "Update ready")
        cx, cy = x + w - pad - 3, top + 9.5
        c.setStrokeColor(OS_TEXT); c.setLineWidth(0.7)
        c.line(cx - 3, self.Y(cy - 3), cx + 3, self.Y(cy + 3))
        c.line(cx - 3, self.Y(cy + 3), cx + 3, self.Y(cy - 3))
        # info icon
        iy = top + bar + pad
        c.setFillColor(INFO_BLUE)
        c.circle(x + pad + 9, self.Y(iy + 9), 9, stroke=0, fill=1)
        c.setFillColor(WHITE); c.setFont("SegoeUI-Bold", 11)
        c.drawCentredString(x + pad + 9, self.Y(iy + 13), "i")
        # main instruction and detail
        yy = iy + 11
        c.setFillColor(INSTRUCTION); c.setFont("SegoeUI", 9.6)
        c.drawString(text_x, self.Y(yy), f"Agent CRM {VERSION} is ready to install.")
        yy += 4
        for ln in detail:
            yy += 10
            self._draw_line_tokens(ln, text_x, yy - 2.2)
        yy += 7
        # command links; the first is the one to click
        for i, label in enumerate(["Restart now", "Later"]):
            ly = yy + i * link_h
            ax, ay = text_x + 2, ly + link_h / 2
            if i == 0:
                c.setStrokeColor(ACCENT); c.setLineWidth(1.2)
                c.roundRect(text_x - 6, self.Y(ly + link_h - 1), w - (text_x - x) - pad + 6,
                            link_h - 2, 4, stroke=1, fill=0)
            c.setStrokeColor(LINK_ARROW); c.setLineWidth(1.3); c.setLineCap(1)
            c.line(ax, self.Y(ay), ax + 8, self.Y(ay))
            c.line(ax + 4.5, self.Y(ay - 3.5), ax + 8, self.Y(ay))
            c.line(ax + 4.5, self.Y(ay + 3.5), ax + 8, self.Y(ay))
            c.setFillColor(INSTRUCTION); c.setFont("SegoeUI", 8.8)
            c.drawString(ax + 15, self.Y(ay + 3), label)
        return h

    def update_section(self, text, caption):
        """Text on the left, the WHAT YOU'LL SEE panel on the right: side by
        side is what keeps the whole guide on one page."""
        pad, pill_h, gap = 9.0, 13.0, 6.0
        dlg_w = 230.0
        panel_w = dlg_w + 2 * pad + 4
        panel_h = pad + pill_h + gap + self._update_dialog_size(dlg_w)[1] + pad + 4
        self.ensure(panel_h + 40)
        top = self.y + 2
        lines = _wrap(text, CW - panel_w - 18, "SegoeUI", 9.2, TEXT)
        yy = self.y
        for ln in lines:
            yy += 11.6
            self._draw_line_tokens(ln, M, yy - 3)
        x = RIGHT - panel_w
        c = self.c
        c.setFillColor(SHADOW)
        c.roundRect(x + 1.5, self.Y(top + panel_h + 2), panel_w, panel_h, 6, stroke=0, fill=1)
        c.setFillColor(WHITE); c.setStrokeColor(ACCENT); c.setLineWidth(1.0)
        c.roundRect(x, self.Y(top + panel_h), panel_w, panel_h, 6, stroke=1, fill=1)
        label = "WHAT YOU'LL SEE"
        pw = pdfmetrics.stringWidth(label, "SegoeUI-Bold", 6.6) + 14
        c.setFillColor(ACCENT)
        c.roundRect(x + pad, self.Y(top + pad + pill_h), pw, pill_h, 6.5, stroke=0, fill=1)
        c.setFillColor(WHITE); c.setFont("SegoeUI-Bold", 6.6)
        c.drawCentredString(x + pad + pw / 2, self.Y(top + pad + 9.4), label)
        self._update_dialog(x + pad + 2, top + pad + pill_h + gap, dlg_w)
        self._panel_caption(top, panel_h, caption, center=x + panel_w / 2)
        self.y = max(self.y, yy + 6)

    def save(self):
        self.c.save()


# ══ The guide — one page: install, sign in, update ═══════════════════════════
g = Guide()

g.para("A quick guide for **Windows**. Install once — Agent CRM keeps itself "
       "updated after that.")
g.rule()

g.heading("1 · Download")
g.para(f"Go to the [Agent CRM download page]({RELEASES_URL}) → **Assets** and "
       f"download **{INSTALLER}**. That is the only file you need: "
       "`latest.yml`, the `.blockmap` and `SHA256SUMS.txt` are for the "
       "app's updater and for IT.")

g.heading("2 · Install", keep=150)
g.para("Open the file. **Windows may stop it the first time** because the "
       "installer is not code-signed yet — expected, not an error. Click "
       "**More info**, then **Run anyway**, as shown below. Then keep the "
       "defaults: **Next** → **Install** → **Finish**.")
g.smartscreen_row("Left: click More info. Right: then Run anyway.")

g.heading("3 · Open & sign in")
g.para("Open **Agent CRM** from the Start Menu or the desktop shortcut. Type "
       "the **phone number IT registered for you** and click **Sign in** — "
       "there is no password and no account to create. A new install has no "
       "agents on it, so **ask IT to add your number first**. **You're "
       "done** — steps 1–3 are one time only.")

g.heading("Your leads")
g.para("Leads are saved on this PC in `%APPDATA%\\Agent CRM\\data`, not in "
       "the install folder. Updating or reinstalling keeps them, and "
       "uninstalling does not delete them. Each PC keeps its own leads; they "
       "are not shared between computers.")

g.heading("Updating", keep=170)
g.update_section(
    "Agent CRM checks for updates every few hours and downloads them in the "
    "background. When one is ready, an **Update ready** box appears — click "
    "**Restart now**, or **Later** to install it when you close the app. "
    "Your leads are kept. Questions? Ask **IT**.",
    "The Update ready box — click Restart now")

g.save()
print("Wrote", OUT)
