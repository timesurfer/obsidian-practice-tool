# Practice Tool

Obsidian community plugin (v0) for Holacracy / PowerShift tension processing.

Capture a tension as a markdown note, then create at least one linked next action — inside the vault, without chat history or loose HTML.

**Plugin id:** `obsidian-practice-tool`  
**Display name:** Practice Tool  
**Governance-ref:** GL-2026-09-19-003

## What v0 does

1. **Capture tension** — prompt for a title (and optional description), then create a note in a configurable folder (default `70 Desk/Tensions`). The folder is created if it is missing.
2. **Add next action from tension** — if the active file is a tension, use it; otherwise pick a tension. Creates a next-action note (default folder `70 Desk/Next Actions`) with bidirectional wikilinks.
3. **Settings** — tension folder path and next-action folder path.

### Tension frontmatter

```yaml
type: tension
status: open
created: 2026-09-19
source: "[[Optional source note]]"   # only when a note is active at capture
```

### Next-action frontmatter

```yaml
type: next-action
status: open
created: 2026-09-19
```

Out of scope for v0: Grok/agent bridge, GlassFrog, multi-user sync, full governance meeting UI.

## Develop / install in a vault (Socrates)

Obsidian loads plugins from `<vault>/.obsidian/plugins/<plugin-id>/`. For this plugin that folder must be:

```text
<vault>/.obsidian/plugins/obsidian-practice-tool/
```

### One-time setup

1. Enable **Community plugins** and **Restricted mode off** in Obsidian settings (needed for any third-party plugin, including local/dev ones).
2. Clone or copy this repo into that plugin folder **or** symlink it:

```bash
# from this repository
npm install
npm run build

# install into the vault (example)
mkdir -p "/path/to/Socrates/.obsidian/plugins/obsidian-practice-tool"
cp main.js manifest.json styles.css "/path/to/Socrates/.obsidian/plugins/obsidian-practice-tool/"
```

If you prefer to develop in place:

```bash
git clone <this-repo-url> "/path/to/Socrates/.obsidian/plugins/obsidian-practice-tool"
cd "/path/to/Socrates/.obsidian/plugins/obsidian-practice-tool"
npm install
npm run dev    # watch rebuild; or npm run build for a production bundle
```

3. Reload Obsidian (or **Community plugins → Reload plugins**).
4. Enable **Practice Tool**.
5. Optional: **Settings → Practice Tool** and confirm the folder paths for your vault.

Required files in the plugin folder after build: `main.js`, `manifest.json`, and `styles.css`.

### Build

```bash
npm install && npm run build
```

- `npm run dev` — esbuild watch (inline sourcemaps)
- `npm run build` — TypeScript check + production bundle (`main.js`)

## Demo-script (Patrick Show & Tell)

Eén complete tension-cycle in de vault (bijv. Socrates). Nederlands, zodat de practice voelbaar is.

1. **Voorbereiden**  
   Open de vault. Controleer dat Practice Tool aan staat. Map-defaults: `70 Desk/Tensions` en `70 Desk/Next Actions` (of pas ze aan in Settings).

2. **Spanning vastleggen**  
   Command palette (`Ctrl/Cmd+P`) → **Capture tension**.  
   Titel, bijvoorbeeld: *Stand-up duurt te lang, de echte spanningen komen niet op tafel.*  
   Optionele beschrijving: *We blijven rapporteren i.p.v. governance/operations te scheiden.*  
   Bevestig **Vastleggen**.

3. **Check de note**  
   Er ligt nu een markdown-note in de tension-map met properties `type: tension`, `status: open`, `created` (ISO-datum). Geen chatlog, geen HTML — één note als bron van waarheid.

4. **Next action koppelen**  
   Blijf op die tension-note (of kies er een via de command). Command palette → **Add next action from tension**.  
   Titel, bijvoorbeeld: *Voorstel: timebox stand-up op 10 minuten, spanningen naar triage.*  
   Bevestig **Aanmaken**.

5. **Traceerbaarheid laten zien**  
   De next-action-note heeft `type: next-action` en een wikilink *Vanuit spanning: [[…]]*.  
   In de tension-note staat onder **Next actions** een wikilink terug.  
   Dat is de cycle: spanning → minstens één next action, bidirectioneel in de vault.

6. **Klaar voor het gesprek**  
   Optioneel een tweede next action vanaf dezelfde spanning. Geen GlassFrog, geen agent-brug — alleen practice in Obsidian.
