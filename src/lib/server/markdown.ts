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
	const normalized = language.trim().toLowerCase().split(/\s+/)[0]?.replace(/^language-/, '');
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

	const label = language ? languageLabels[language] ?? language.toUpperCase() : null;
	const codeClass = language
		? ` class="hljs language-${escapeHtml(language)}"`
		: ' class="hljs"';
	const content = (escaped ? text : escapeHtml(text)).replace(/\n$/, '');
	const header = `
		<div class="markdown-code-toolbar">
			${label ? `<div class="markdown-code-label">${escapeHtml(label)}</div>` : '<div class="markdown-code-label"></div>'}
			<div class="markdown-code-copy-control" data-copy-control></div>
		</div>
	`;

	return `<div class="not-prose markdown-code-shell">${header}<pre class="markdown-code-block"><code${codeClass}>${content}\n</code></pre></div>`;
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

export async function renderMarkdown(content: string): Promise<string> {
	return await markdown.parse(content ?? '');
}
