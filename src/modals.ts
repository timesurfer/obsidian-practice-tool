import { App, FuzzySuggestModal, Modal, Notice, Setting, TFile } from "obsidian";

export interface CaptureResult {
	title: string;
	description: string;
}

export class CaptureModal extends Modal {
	private title = "";
	private description = "";

	constructor(
		app: App,
		private readonly options: {
			heading: string;
			titlePlaceholder: string;
			descriptionPlaceholder: string;
			submitLabel: string;
			onSubmit: (result: CaptureResult) => void;
		},
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl, modalEl } = this;
		modalEl.addClass("practice-tool-modal");
		contentEl.createEl("h2", { text: this.options.heading });

		new Setting(contentEl).setName("Titel").addText((text) => {
			text.setPlaceholder(this.options.titlePlaceholder).onChange((value) => {
				this.title = value;
			});
			text.inputEl.addEventListener("keydown", (event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					this.submit();
				}
			});
			window.setTimeout(() => text.inputEl.focus(), 0);
		});

		new Setting(contentEl)
			.setName("Beschrijving")
			.setDesc("Optioneel")
			.addTextArea((text) => {
				text
					.setPlaceholder(this.options.descriptionPlaceholder)
					.onChange((value) => {
						this.description = value;
					});
			});

		new Setting(contentEl).addButton((button) =>
			button
				.setButtonText(this.options.submitLabel)
				.setCta()
				.onClick(() => this.submit()),
		);
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private submit(): void {
		const title = this.title.trim();
		if (!title) {
			new Notice("Titel is verplicht.");
			return;
		}
		this.close();
		this.options.onSubmit({
			title,
			description: this.description.trim(),
		});
	}
}

export class TensionSuggestModal extends FuzzySuggestModal<TFile> {
	constructor(
		app: App,
		private readonly tensions: TFile[],
		private readonly onChoose: (file: TFile) => void,
	) {
		super(app);
		this.setPlaceholder("Kies een spanning…");
	}

	getItems(): TFile[] {
		return this.tensions;
	}

	getItemText(item: TFile): string {
		return item.basename;
	}

	onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}
