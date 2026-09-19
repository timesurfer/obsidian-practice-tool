export const DEFAULT_TENSION_FOLDER = "70 Desk/Tensions";
export const DEFAULT_NEXT_ACTION_FOLDER = "70 Desk/Next Actions";

export const FRONTMATTER_TYPE_TENSION = "tension";
export const FRONTMATTER_TYPE_NEXT_ACTION = "next-action";
export const FRONTMATTER_STATUS_OPEN = "open";

export function sanitizeFileName(name: string): string {
	const cleaned = name
		.replace(/[\\/:*?"<>|#[\]]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 200);
	return cleaned || "Untitled";
}

export function localIsoDate(now: Date = new Date()): string {
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function yamlScalar(value: string): string {
	if (value === "") {
		return '""';
	}
	if (/[:#\[\]{},&*?!'|>%@`]|^\s|\s$/.test(value) || /[\n\r]/.test(value)) {
		return JSON.stringify(value);
	}
	return value;
}

export function parseFrontmatterType(content: string): string | undefined {
	if (!content.startsWith("---")) {
		return undefined;
	}
	const end = content.indexOf("\n---", 3);
	if (end === -1) {
		return undefined;
	}
	const yaml = content.slice(4, end);
	const match = yaml.match(/^type:\s*(.+)\s*$/m);
	const raw = match?.[1]?.trim();
	if (!raw) {
		return undefined;
	}
	return raw.replace(/^["']|["']$/g, "");
}

export interface NoteFrontmatter {
	type: string;
	status: string;
	created: string;
	source?: string;
}

export function buildNoteMarkdown(params: {
	frontmatter: NoteFrontmatter;
	title: string;
	description?: string;
	extraBody?: string;
}): string {
	const lines = [
		"---",
		`type: ${params.frontmatter.type}`,
		`status: ${params.frontmatter.status}`,
		`created: ${params.frontmatter.created}`,
	];
	if (params.frontmatter.source) {
		lines.push(`source: ${yamlScalar(params.frontmatter.source)}`);
	}
	lines.push("---", "", `# ${params.title}`, "");
	if (params.description) {
		lines.push(params.description, "");
	}
	if (params.extraBody) {
		lines.push(params.extraBody.trimEnd(), "");
	}
	return lines.join("\n");
}

export function appendNextActionWikilink(
	content: string,
	actionBasename: string,
): string {
	const linkLine = `- [[${actionBasename}]]`;
	if (content.includes(`[[${actionBasename}]]`)) {
		return content;
	}

	const heading = /^##\s+(Next actions|Volgende acties)\s*$/im;
	const match = heading.exec(content);
	if (match && match.index !== undefined) {
		const insertAt = match.index + match[0].length;
		const before = content.slice(0, insertAt);
		let after = content.slice(insertAt);
		if (!after.startsWith("\n")) {
			after = `\n${after}`;
		}
		return `${before}\n${linkLine}${after}`;
	}

	const trimmed = content.trimEnd();
	return `${trimmed}\n\n## Next actions\n\n${linkLine}\n`;
}
