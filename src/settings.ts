import { App, PluginSettingTab, Setting } from "obsidian";
import type PracticeToolPlugin from "./main";
import {
	DEFAULT_NEXT_ACTION_FOLDER,
	DEFAULT_TENSION_FOLDER,
} from "./notes";

export interface PracticeToolSettings {
	tensionFolder: string;
	nextActionFolder: string;
}

export const DEFAULT_SETTINGS: PracticeToolSettings = {
	tensionFolder: DEFAULT_TENSION_FOLDER,
	nextActionFolder: DEFAULT_NEXT_ACTION_FOLDER,
};

export class PracticeToolSettingTab extends PluginSettingTab {
	plugin: PracticeToolPlugin;

	constructor(app: App, plugin: PracticeToolPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Tension folder")
			.setDesc("Vault path for new tension notes. Created if it does not exist.")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_TENSION_FOLDER)
					.setValue(this.plugin.settings.tensionFolder)
					.onChange(async (value) => {
						this.plugin.settings.tensionFolder = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Next-action folder")
			.setDesc(
				"Vault path for new next-action notes. Created if it does not exist.",
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_NEXT_ACTION_FOLDER)
					.setValue(this.plugin.settings.nextActionFolder)
					.onChange(async (value) => {
						this.plugin.settings.nextActionFolder = value.trim();
						await this.plugin.saveSettings();
					}),
			);
	}
}
