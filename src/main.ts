import { App, normalizePath, Notice, Plugin, TFile, TFolder } from "obsidian";
import { CaptureModal, TensionSuggestModal } from "./modals";
import {
	appendNextActionWikilink,
	buildNoteMarkdown,
	DEFAULT_NEXT_ACTION_FOLDER,
	DEFAULT_TENSION_FOLDER,
	FRONTMATTER_STATUS_OPEN,
	FRONTMATTER_TYPE_NEXT_ACTION,
	FRONTMATTER_TYPE_TENSION,
	localIsoDate,
	parseFrontmatterType,
	sanitizeFileName,
} from "./notes";
import {
	DEFAULT_SETTINGS,
	PracticeToolSettings,
	PracticeToolSettingTab,
} from "./settings";

export default class PracticeToolPlugin extends Plugin {
	settings!: PracticeToolSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addCommand({
			id: "capture-tension",
			name: "Capture tension",
			callback: () => this.openCaptureTensionModal(),
		});

		this.addCommand({
			id: "add-next-action-from-tension",
			name: "Add next action from tension",
			callback: () => this.addNextActionFromTension(),
		});

		this.addSettingTab(new PracticeToolSettingTab(this.app, this));
	}

	onunload(): void {}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<PracticeToolSettings>,
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private openCaptureTensionModal(): void {
		new CaptureModal(this.app, {
			heading: "Spanning vastleggen",
			titlePlaceholder: "Wat is de spanning?",
			descriptionPlaceholder: "Meer context (optioneel)",
			submitLabel: "Vastleggen",
			onSubmit: (result) => {
				void this.captureTension(result.title, result.description);
			},
		}).open();
	}

	private async captureTension(
		title: string,
		description: string,
	): Promise<void> {
		try {
			const folder = await ensureFolder(
				this.app,
				this.settings.tensionFolder || DEFAULT_TENSION_FOLDER,
			);
			const activeFile = this.app.workspace.getActiveFile();
			const source = activeFile ? `[[${activeFile.basename}]]` : undefined;
			const path = uniqueMarkdownPath(this.app, folder, title);
			const content = buildNoteMarkdown({
				frontmatter: {
					type: FRONTMATTER_TYPE_TENSION,
					status: FRONTMATTER_STATUS_OPEN,
					created: localIsoDate(),
					source,
				},
				title,
				description: description || undefined,
				extraBody: "## Next actions\n",
			});
			const file = await this.app.vault.create(path, content);
			await this.app.workspace.getLeaf(false).openFile(file);
			new Notice(`Spanning vastgelegd: ${file.basename}`);
		} catch (error) {
			console.error(error);
			new Notice(errorMessage(error, "Kon spanning niet vastleggen."));
		}
	}

	private async addNextActionFromTension(): Promise<void> {
		const active = this.app.workspace.getActiveFile();
		if (active && (await this.isTensionFile(active))) {
			this.openNextActionModal(active);
			return;
		}

		const tensions = this.listTensionFiles();
		if (tensions.length === 0) {
			new Notice("Geen spanningen gevonden. Leg eerst een spanning vast.");
			return;
		}

		new TensionSuggestModal(this.app, tensions, (file) => {
			this.openNextActionModal(file);
		}).open();
	}

	private openNextActionModal(tension: TFile): void {
		new CaptureModal(this.app, {
			heading: "Next action vanuit spanning",
			titlePlaceholder: "Wat is de volgende actie?",
			descriptionPlaceholder: "Meer detail (optioneel)",
			submitLabel: "Aanmaken",
			onSubmit: (result) => {
				void this.createNextAction(tension, result.title, result.description);
			},
		}).open();
	}

	private async createNextAction(
		tension: TFile,
		title: string,
		description: string,
	): Promise<void> {
		try {
			const folder = await ensureFolder(
				this.app,
				this.settings.nextActionFolder || DEFAULT_NEXT_ACTION_FOLDER,
			);
			const path = uniqueMarkdownPath(this.app, folder, title);
			const extraBody = `Vanuit spanning: [[${tension.basename}]]`;
			const content = buildNoteMarkdown({
				frontmatter: {
					type: FRONTMATTER_TYPE_NEXT_ACTION,
					status: FRONTMATTER_STATUS_OPEN,
					created: localIsoDate(),
				},
				title,
				description: description || undefined,
				extraBody,
			});
			const actionFile = await this.app.vault.create(path, content);
			await this.app.vault.process(tension, (current) =>
				appendNextActionWikilink(current, actionFile.basename),
			);
			await this.app.workspace.getLeaf(false).openFile(actionFile);
			new Notice(`Next action aangemaakt: ${actionFile.basename}`);
		} catch (error) {
			console.error(error);
			new Notice(errorMessage(error, "Kon next action niet aanmaken."));
		}
	}

	private async isTensionFile(file: TFile): Promise<boolean> {
		const cached = this.app.metadataCache.getFileCache(file)?.frontmatter?.type;
		if (cached === FRONTMATTER_TYPE_TENSION) {
			return true;
		}
		const content = await this.app.vault.cachedRead(file);
		return parseFrontmatterType(content) === FRONTMATTER_TYPE_TENSION;
	}

	private listTensionFiles(): TFile[] {
		return this.app.vault
			.getMarkdownFiles()
			.filter(
				(file) =>
					this.app.metadataCache.getFileCache(file)?.frontmatter?.type ===
					FRONTMATTER_TYPE_TENSION,
			)
			.sort((a, b) => a.basename.localeCompare(b.basename));
	}
}

async function ensureFolder(app: App, folderPath: string): Promise<string> {
	const normalized = normalizePath(folderPath.trim());
	if (!normalized) {
		throw new Error("Folder path is empty.");
	}

	const parts = normalized.split("/");
	let current = "";
	for (const part of parts) {
		current = current ? `${current}/${part}` : part;
		const existing = app.vault.getAbstractFileByPath(current);
		if (!existing) {
			await app.vault.createFolder(current);
		} else if (!(existing instanceof TFolder)) {
			throw new Error(`Path exists but is not a folder: ${current}`);
		}
	}
	return normalized;
}

function uniqueMarkdownPath(app: App, folder: string, title: string): string {
	const base = sanitizeFileName(title);
	const candidate = (n?: number) =>
		normalizePath(`${folder}/${n ? `${base} ${n}` : base}.md`);
	let path = candidate();
	let n = 2;
	while (app.vault.getAbstractFileByPath(path)) {
		path = candidate(n);
		n += 1;
	}
	return path;
}

function errorMessage(error: unknown, fallback: string): string {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return fallback;
}
