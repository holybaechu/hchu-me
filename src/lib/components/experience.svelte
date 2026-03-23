<script lang="ts">
	import { Building2 } from '@lucide/svelte';

	type Experience = {
		organization: string;
		position: string;
		period: string;
		description: string;
		iconUrl: string | null;
	};

	let { experience }: { experience: Experience } = $props();
</script>

<article class="py-2">
	<div class="flex items-start gap-3">
		<div
			class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-secondary-foreground"
		>
			{#if experience.iconUrl}
				<img src={experience.iconUrl} alt={experience.organization} class="h-4 w-4" />
			{:else}
				<Building2 class="h-4 w-4" />
			{/if}
		</div>

		<div class="min-w-0 space-y-1">
			<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
				<h3 class="text-base leading-tight font-semibold">{experience.organization}</h3>
				<p class="text-sm font-medium text-muted-foreground">{experience.position}</p>
			</div>
			<p class="text-xs tracking-wide text-muted-foreground/90 uppercase">{experience.period}</p>
			<p class="text-sm leading-relaxed text-foreground/90">{experience.description}</p>
		</div>
	</div>
</article>
