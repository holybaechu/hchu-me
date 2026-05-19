import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderMarkdown } from './markdown.ts';

test('continues parsing markdown after a raw HTML table from Notion', async () => {
	const input = `<table header-row="true">
<tbody><tr>
<td>모드</td>
<td>뜻</td>
</tr>
<tr>
<td>\`w\`</td>
<td>쓰기 모드</td>
</tr></tbody></table>
주의할 점은 \`w\` 모드이다.
## 3. 파일에 내용 쓰기
\`\`\`python
print("hello")
\`\`\``;

	const html = await renderMarkdown(input);

	assert.match(html, /<td><code>w<\/code><\/td>/);
	assert.match(html, /<p>주의할 점은 <code>w<\/code> 모드이다\.<\/p>/);
	assert.match(html, /<h2>3\. 파일에 내용 쓰기<\/h2>/);
	assert.match(html, /markdown-code-shell/);
	assert.doesNotMatch(html, /## 3\. 파일에 내용 쓰기/);
	assert.doesNotMatch(html, /```python/);
});
