<script lang="ts">
	import { ArrowLeft, ChevronRight } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages.js';
	import Seo from '$lib/components/seo.svelte';

	let { data } = $props();

	let selectedTagIds = $state<Set<string>>(new Set());

	function toggleTag(tagId: string) {
		const newSet = new Set(selectedTagIds);
		if (newSet.has(tagId)) {
			newSet.delete(tagId);
		} else {
			newSet.add(tagId);
		}
		selectedTagIds = newSet;
	}

	let uniqueTags = $derived.by(() => {
		const map = new Map();
		for (const blog of data.blogs) {
			if (!blog.tags) continue;
			for (const tag of blog.tags) {
				if (!map.has(tag.id)) {
					map.set(tag.id, tag);
				}
			}
		}
		return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
	});

	let filteredBlogs = $derived.by(() => {
		if (selectedTagIds.size === 0) return data.blogs;
		return data.blogs.filter((blog) => {
			if (!blog.tags) return false;
			const tagIds = blog.tags.map((t) => t.id);
			return Array.from(selectedTagIds).every((id) => tagIds.includes(id));
		});
	});

	function getTagColorClass(colorName: string, isSelected: boolean) {
		const map: Record<string, string> = {
			brown: isSelected
				? 'bg-[#937264] text-white'
				: 'bg-[#937264]/20 text-[#937264] hover:bg-[#937264]/30',
			gray: isSelected
				? 'bg-[#9B9A97] text-white'
				: 'bg-muted text-muted-foreground hover:bg-muted/80',
			orange: isSelected
				? 'bg-[#FFA344] text-white'
				: 'bg-[#FFA344]/20 text-[#FFA344] hover:bg-[#FFA344]/30',
			yellow: isSelected
				? 'bg-[#FFDC49] text-black'
				: 'bg-[#FFDC49]/20 text-[#D9B728] hover:bg-[#FFDC49]/30',
			green: isSelected
				? 'bg-[#4DAB9A] text-white'
				: 'bg-[#4DAB9A]/20 text-[#4DAB9A] hover:bg-[#4DAB9A]/30',
			blue: isSelected
				? 'bg-[#529CCA] text-white'
				: 'bg-[#529CCA]/20 text-[#529CCA] hover:bg-[#529CCA]/30',
			purple: isSelected
				? 'bg-[#9A6DD7] text-white'
				: 'bg-[#9A6DD7]/20 text-[#9A6DD7] hover:bg-[#9A6DD7]/30',
			pink: isSelected
				? 'bg-[#E255A1] text-white'
				: 'bg-[#E255A1]/20 text-[#E255A1] hover:bg-[#E255A1]/30',
			red: isSelected
				? 'bg-[#FF7369] text-white'
				: 'bg-[#FF7369]/20 text-[#FF7369] hover:bg-[#FF7369]/30',
			default: isSelected
				? 'bg-primary text-primary-foreground'
				: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
		};
		return map[colorName] || map.default;
	}
</script>

<Seo title={`${m.blog_title()} | ${m.site_title()}`} description={m.blog_title()} />

<div class="py-6">
	<Button href="/" variant="ghost" class="gap-2">
		<ArrowLeft class="h-4 w-4" />
		{m.blog_back()}
	</Button>
</div>

<section class="space-y-6">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold md:text-4xl">{m.blog_title()}</h1>
	</div>

	{#if data.error}
		<p class="text-sm text-destructive">{data.error}</p>
	{:else if data.blogs.length === 0}
		<p class="text-sm text-muted-foreground">{m.blog_empty()}</p>
	{:else}
		{#if uniqueTags.length > 0}
			<div class="mb-6 flex flex-wrap gap-2">
				{#each uniqueTags as tag (tag.id)}
					<button
						class={`rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer ${getTagColorClass(tag.color, selectedTagIds.has(tag.id))}`}
						onclick={() => toggleTag(tag.id)}
					>
						{tag.name}
					</button>
				{/each}
			</div>
		{/if}

		<div class="flex flex-col gap-4">
			{#if filteredBlogs.length === 0}
				<p class="text-sm text-muted-foreground">선택한 태그와 일치하는 게시물이 없습니다.</p>
			{/if}
			{#each filteredBlogs as blog (blog.id)}
				<a
					href={resolve(`/blog/${blog.slug}`)}
					class="group block cursor-pointer rounded-lg border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent/50"
				>
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-lg font-semibold transition-colors group-hover:text-primary">
							{blog.title}
						</h2>
						<ChevronRight
							class="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
						/>
					</div>
					{#if blog.description}
						<p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{blog.description}</p>
					{/if}
					{#if blog.tags && blog.tags.length > 0}
						<div class="mt-4 flex flex-wrap gap-2">
							{#each blog.tags as tag (tag.id)}
								<span
									class={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getTagColorClass(tag.color, false)} min-w-10 text-center`}
								>
									{tag.name}
								</span>
							{/each}
						</div>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</section>
