<script lang="ts">
	import { ChevronRight, ExternalLink, Github } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { resolve } from '$app/paths';

	type ProjectCardData = {
		title: string;
		description: string | null;
		github_url: string | null;
		website_url: string | null;
		techs: { name: string; icon_url: string | null }[];
	};

	let {
		project,
		href,
		compact = false,
	}: {
		project: ProjectCardData;
		href: `/project/${string}`;
		compact?: boolean;
	} = $props();

	const visibleTechCount = $derived(compact ? 3 : 4);
	function isInteractiveTarget(target: EventTarget | null): boolean {
		return target instanceof Element && Boolean(target.closest('a, button, input, select, textarea'));
	}

	function navigateToDetail(event: MouseEvent | KeyboardEvent) {
		if (isInteractiveTarget(event.target)) return;
		goto(resolve(href));
	}

	function handleCardKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		navigateToDetail(event);
	}
</script>

{#if compact}
	<a
		href={resolve(href)}
		class="group block rounded-lg border border-border/60 px-3 py-2 text-sm transition-all hover:bg-accent"
	>
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0 flex-1">
				<h3 class="text-base font-semibold transition-colors group-hover:text-primary">
					{project.title}
				</h3>
				{#if project.description}
					<p class="mt-1 truncate text-xs text-muted-foreground">
						{project.description}
					</p>
				{/if}
				{#if project.techs.length > 0}
					<div class="mt-2 flex flex-wrap gap-1.5">
						{#each project.techs.slice(0, visibleTechCount) as tech (tech.name)}
							<span
								class="inline-flex items-center gap-1 rounded bg-secondary/50 px-1.5 py-0.5 text-[11px] text-secondary-foreground"
							>
								{#if tech.icon_url}
									<img src={tech.icon_url} alt="" class="h-3 w-3 rounded-sm object-contain" />
								{:else}
									<span class="inline-flex h-3 w-3 items-center justify-center rounded-sm bg-muted text-[8px] uppercase text-muted-foreground">
										{tech.name.slice(0, 1)}
									</span>
								{/if}
								{tech.name}
							</span>
						{/each}
						{#if project.techs.length > visibleTechCount}
							<span class="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground">
								+{project.techs.length - visibleTechCount}
							</span>
						{/if}
					</div>
				{/if}
			</div>
			<ChevronRight class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:text-primary" />
		</div>
	</a>
{:else}
	<div
		class="group cursor-pointer rounded-lg border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent/50"
		role="link"
		tabindex="0"
		aria-label={`${project.title} 상세 페이지로 이동`}
		onclick={navigateToDetail}
		onkeydown={handleCardKeydown}
	>
		<div class="space-y-3">
			<div class="flex items-start justify-between gap-3">
				<div class="inline-flex min-w-0 items-center gap-1">
					<h3 class="truncate text-lg font-semibold transition-colors group-hover:text-primary">
						{project.title}
					</h3>
					<ChevronRight class="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
				</div>
				{#if project.github_url || project.website_url}
					<div class="flex shrink-0 flex-wrap items-center gap-1.5">
						{#if project.github_url}
							<Button
								href={project.github_url}
								target="_blank"
								rel="noopener noreferrer"
								variant="outline"
								aria-label="Open GitHub"
								title="GitHub"
							>
								<Github class="h-3.5 w-3.5" />
							</Button>
						{/if}
						{#if project.website_url}
							<Button
								href={project.website_url}
								target="_blank"
								rel="noopener noreferrer"
								variant="outline"
								aria-label="Open website"
								title="Website"
							>
								<ExternalLink class="h-3.5 w-3.5" />
							</Button>
						{/if}
					</div>
				{/if}
			</div>
			{#if project.description}
				<p class="line-clamp-2 text-sm text-muted-foreground">
					{project.description}
				</p>
			{/if}
			{#if project.techs.length > 0}
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each project.techs.slice(0, visibleTechCount) as tech (tech.name)}
						<span
							class="inline-flex items-center gap-1.5 rounded bg-secondary/50 px-2 py-0.5 text-xs text-secondary-foreground"
						>
							{#if tech.icon_url}
								<img src={tech.icon_url} alt="" class="h-3.5 w-3.5 rounded-sm object-contain" />
							{:else}
								<span
									class="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-muted text-[9px] uppercase text-muted-foreground"
								>
									{tech.name.slice(0, 1)}
								</span>
							{/if}
							{tech.name}
						</span>
					{/each}
					{#if project.techs.length > visibleTechCount}
						<span class="rounded px-2 py-0.5 text-xs text-muted-foreground">
							+{project.techs.length - visibleTechCount}
						</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
