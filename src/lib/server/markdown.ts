import { Marked, type Tokens } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdownLanguage from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdownLanguage);
hljs.registerLanguage('python', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

const languageAliases: Record<string, string> = {
	bash: 'bash',
	cjs: 'javascript',
	css: 'css',
	html: 'xml',
	javascript: 'javascript',
	js: 'javascript',
	json: 'json',
	jsx: 'javascript',
	markdown: 'markdown',
	md: 'markdown',
	mermaid: 'mermaid',
	mjs: 'javascript',
	py: 'python',
	python: 'python',
	shell: 'bash',
	sh: 'bash',
	sql: 'sql',
	svelte: 'xml',
	ts: 'typescript',
	tsx: 'typescript',
	typescript: 'typescript',
	xml: 'xml',
	yaml: 'yaml',
	yml: 'yaml',
	zsh: 'bash'
};

const languageLabels: Record<string, string> = {
	bash: 'Bash',
	css: 'CSS',
	javascript: 'JavaScript',
	json: 'JSON',
	markdown: 'Markdown',
	mermaid: 'Mermaid',
	python: 'Python',
	sql: 'SQL',
	typescript: 'TypeScript',
	xml: 'HTML',
	yaml: 'YAML'
};

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function normalizeLanguage(language?: string | null): string | null {
	if (!language) return null;
	const normalized = language
		.trim()
		.toLowerCase()
		.split(/\s+/)[0]
		?.replace(/^language-/, '');
	if (!normalized) return null;
	return languageAliases[normalized] ?? normalized;
}

function highlightCode(code: string, language: string | null): string {
	if (language && hljs.getLanguage(language)) {
		return hljs.highlight(code, {
			language,
			ignoreIllegals: true
		}).value;
	}

	return hljs.highlightAuto(code).value;
}

function renderCodeBlock({ text, lang, escaped }: Tokens.Code): string {
	const language = normalizeLanguage(lang);

	if (language === 'mermaid') {
		return `<pre><code class="language-mermaid">${escapeHtml(text)}</code></pre>`;
	}

	const label = language ? (languageLabels[language] ?? language.toUpperCase()) : null;
	const codeClass = language ? ` class="hljs language-${escapeHtml(language)}"` : ' class="hljs"';
	const content = (escaped ? text : escapeHtml(text)).replace(/\n$/, '');
	const header = `
		<div class="markdown-code-toolbar">
			${label ? `<div class="markdown-code-label">${escapeHtml(label)}</div>` : '<div class="markdown-code-label"></div>'}
			<div class="markdown-code-copy-control" data-copy-control></div>
		</div>
	`;

	return `<div class="not-prose markdown-code-shell">${header}<pre class="markdown-code-block"><code${codeClass}>${content}\n</code></pre></div>`;
}

function normalizeNotionMarkdown(content: string): string {
	const lines = content.split('\n');
	const normalized: string[] = [];
	let fence: { marker: '`' | '~'; length: number } | null = null;

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		const comparableLine = line.replace(/\r$/, '');
		const fenceMatch = /^(?: {0,3})(`{3,}|~{3,})/.exec(comparableLine);

		if (fenceMatch) {
			const marker = fenceMatch[1][0] as '`' | '~';
			const length = fenceMatch[1].length;

			if (!fence) {
				fence = { marker, length };
			} else if (marker === fence.marker && length >= fence.length) {
				fence = null;
			}
		}

		normalized.push(line);

		if (fence) continue;

		const nextLine = lines[index + 1];
		const endsRawTable = /<\/table>[ \t\r]*$/i.test(line);
		const nextLineHasContent = nextLine !== undefined && nextLine.replace(/\r$/, '').trim() !== '';

		if (endsRawTable && nextLineHasContent) {
			// Notion emits tables as raw HTML; Marked needs a blank line before Markdown resumes.
			normalized.push('');
		}
	}

	return normalized.join('\n');
}

const markdown = new Marked({
	gfm: true,
	breaks: true
});

markdown.use(
	markedHighlight({
		langPrefix: 'hljs language-',
		emptyLangClass: 'hljs',
		highlight(code, lang) {
			const language = normalizeLanguage(lang);

			if (language === 'mermaid') {
				return code;
			}

			return highlightCode(code, language);
		}
	}),
	{
		renderer: {
			code(token) {
				return renderCodeBlock(token);
			}
		}
	}
);

async function renderTableCellMarkdown(html: string): Promise<string> {
	const cellPattern = /(<t[hd]\b[^>]*>)([\s\S]*?)(<\/t[hd]>)/gi;
	let result = '';
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = cellPattern.exec(html)) !== null) {
		const [fullMatch, openTag, cellContent, closeTag] = match;
		const leadingWhitespace = cellContent.match(/^\s*/)?.[0] ?? '';
		const trailingWhitespace = cellContent.match(/\s*$/)?.[0] ?? '';
		const contentStart = leadingWhitespace.length;
		const contentEnd = cellContent.length - trailingWhitespace.length;
		const content = cellContent.slice(contentStart, contentEnd);
		const renderedContent = content ? await markdown.parseInline(content) : '';

		result += html.slice(lastIndex, match.index);
		result += openTag;
		result += leadingWhitespace;
		result += renderedContent;
		result += trailingWhitespace;
		result += closeTag;

		lastIndex = match.index + fullMatch.length;
	}

	return result + html.slice(lastIndex);
}

export async function renderMarkdown(content: string): Promise<string> {
	const html = await markdown.parse(normalizeNotionMarkdown(content ?? ''));
	return await renderTableCellMarkdown(html);
}
