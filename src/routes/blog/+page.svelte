<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<svelte:head>
	<title>블로그 | hchu.me</title>
</svelte:head>

<div class="py-6">
	<Button href="/" variant="ghost" class="gap-2">
		<ArrowLeft class="h-4 w-4" />
		뒤로가기
	</Button>
</div>

<section class="space-y-6 pb-8">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold md:text-4xl">블로그</h1>
	</div>

	{#if data.error}
		<p class="text-sm text-destructive">{data.error}</p>
	{:else if data.blogs.length === 0}
		<p class="text-sm text-muted-foreground">아직 등록된 글이 없습니다.</p>
	{:else}
		<div class="flex flex-col gap-4">
			{#each data.blogs as blog (blog.id)}
				<a
					href={resolve(`/blog/${blog.slug}`)}
					class="group block cursor-pointer rounded-lg border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent/50"
				>
					<h2 class="text-lg font-semibold transition-colors group-hover:text-primary">{blog.title}</h2>
					{#if blog.description}
						<p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{blog.description}</p>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</section>
