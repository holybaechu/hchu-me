<script lang="ts">
	import { ArrowLeft, FileText } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.blog.title} | hchu.me</title>
	<meta name="description" content={data.blog.description || data.blog.title} />
</svelte:head>

<div class="py-6">
	<Button href="/blog" variant="ghost" class="gap-2">
		<ArrowLeft class="h-4 w-4" />
		{m.blog_list()}
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

<article class="prose max-w-none py-8 prose-neutral dark:prose-invert">
	<!-- eslint-disable svelte/no-at-html-tags -->
	{@html data.blog.content}
	<!-- eslint-enable -->
</article>
