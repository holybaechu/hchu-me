<script lang="ts">
	import { ArrowLeft, FileText } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import Seo from '$lib/components/seo.svelte';
	import MarkdownViewer from '$lib/components/markdown-viewer.svelte';

	let { data } = $props();
</script>

<Seo
	title={`${data.blog.title} | ${m.site_title()}`}
	description={data.blog.description || data.blog.title}
	type="article"
/>

<div class="py-6">
	<Button href="/blog" variant="ghost" class="gap-2">
		<ArrowLeft class="h-4 w-4" />
		{m.blog_back_to_list()}
	</Button>
</div>

<header class="border-b border-border py-8">
	<div class="space-y-4">
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<FileText class="h-4 w-4" />
			<span>{m.blog_title()}</span>
		</div>
		<h1 class="text-3xl font-bold md:text-4xl">{data.blog.title}</h1>
		{#if data.blog.description}
			<p class="max-w-3xl text-lg text-muted-foreground">
				{data.blog.description}
			</p>
		{/if}
	</div>
</header>

<MarkdownViewer content={data.blog.content} />
