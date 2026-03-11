<script>
	import Button from "$lib/components/ui/button/button.svelte";
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Sheet from '$lib/components/ui/sheet';
	import ProjectCard from '$lib/components/project-card.svelte';
	import Experience from '$lib/components/experience.svelte';
	import { resolve } from '$app/paths';
	import { Github, Mail, ExternalLink, MapPin, Building2, AlertCircle, Layers, Folder, ArrowDownNarrowWide } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';

	let { data } = $props();

	const techByName = $derived(new Map(data.techs.map((tech) => [tech.name, tech])));
	const projectsWithTechMeta = $derived(
		data.projects.map((project) => ({
			...project,
			techs: project.techs.map((name) => ({
				name,
				icon_url: techByName.get(name)?.icon_url ?? null
			}))
		}))
	);

	const techCards = $derived(
		data.techs.map((tech) => {
			const projects = projectsWithTechMeta.filter((project) =>
				project.techs.some((projectTech) => projectTech.name === tech.name)
			);
			return { ...tech, projects };
		})
	);

	const experiences = [
		{
			organization: '경북소프트웨어마이스터고등학교',
			position: '재학생',
			period: `2026 - ${$_('home.sections.experiences.current')}`,
			description: '현재 재학 중인 학교입니다.',
			iconUrl: 'icons/gbsw.webp'
		},
		{
			organization: 'LabyMod',
			position: `${$_('home.sections.experiences.positions.pluginDeveloper')}, ${$_('home.sections.experiences.positions.translator')}`,
			period: '2023 - 2025',
			description: '약 4개의 개인 플러그인을 개발하고 배포했고, 1개의 공식 플러그인에 기여했습니다. 한국어 번역도 담당했습니다.',
			iconUrl: 'icons/labymod.png'
		}
	];
</script>

<svelte:head>
	<title>{$_('home.title')}</title>
</svelte:head>

<!-- Hero -->
<section class="py-6 md:py-14">
	<div class="space-y-4">
		<!-- Intro -->
		<div class="space-y-2">
			<h1 class="text-3xl md:text-5xl font-bold leading-tight">
				{$_('home.hero.greeting')}<br />
				<span class="text-green-600">{$_('home.hero.nameRole')}</span>{$_('home.hero.introSuffix')}
			</h1>
			<p class="text-lg max-w-2xl leading-relaxed">
				{$_('home.hero.description')}
			</p>
			<div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
				<div class="flex items-center gap-1.5">
					<MapPin class="h-4 w-4" />
					<span>{$_('home.hero.location')}</span>
				</div>
				<div class="flex items-center gap-1.5">
					<Building2 class="h-4 w-4" />
					<span>{$_('home.hero.school')}</span>
				</div>
			</div>
		</div>

		<!-- Social Links -->
		<div class="flex flex-wrap gap-3">
			<Button href="https://github.com/holybaechu" target="_blank" rel="noopener noreferrer" variant="outline" class="gap-2">
				<Github class="h-4 w-4" />
				holybaechu
			</Button>
			<Button href="mailto:hello@hchu.me" variant="outline" class="gap-2">
				<Mail class="h-4 w-4" />
				hello@hchu.me
			</Button>
			<Button href={resolve('/blog')} variant="default" class="gap-2">
				{$_('home.hero.blogButton')}
				<ExternalLink class="h-4 w-4" />
			</Button>
		</div>
	</div>
</section>

{#if data.error}
	<!-- Error Message -->
	<section class="py-8">
		<div class="flex items-start gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
			<AlertCircle class="h-5 w-5 mt-0.5 shrink-0" />
			<div>
				<p class="font-medium">{$_('home.error.title')}</p>
				<p class="text-sm mt-1">{data.error}</p>
			</div>
		</div>
	</section>
{/if}

<!-- Tech Stack -->
{#if data.techs.length > 0}
	<section class="py-2">
		<div class="flex items-center gap-2 mb-6">
			<Layers class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-sm font-medium text-muted-foreground tracking-wide uppercase">
				{$_('home.sections.techStack')}
			</h2>
		</div>
		<div class="overflow-x-auto pb-2">
			<div class="flex w-max items-center gap-3 pr-2">
				{#each techCards as tech (tech.id)}
					<Sheet.Root>
						<HoverCard.Root openDelay={0} closeDelay={0}>
							<HoverCard.Trigger>
								<Sheet.Trigger
									class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card transition-all hover:border-primary/50 hover:bg-accent/40 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									aria-label={$_('home.tech.detailsAria', { values: { name: tech.name } })}
								>
									{#if tech.icon_url}
										<img src={tech.icon_url} alt={tech.name} class="h-7 w-7 object-contain" loading="lazy" />
									{:else}
										<span class="text-sm font-semibold text-muted-foreground">
											{tech.name.slice(0, 1).toUpperCase()}
										</span>
									{/if}
								</Sheet.Trigger>
							</HoverCard.Trigger>
							<HoverCard.Content side="top" align="center" class="w-64">
								<div class="flex items-start gap-3">
									<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card">
										{#if tech.icon_url}
											<img src={tech.icon_url} alt={tech.name} class="h-6 w-6 object-contain" loading="lazy" />
										{:else}
											<span class="text-sm font-semibold text-muted-foreground">
												{tech.name.slice(0, 1).toUpperCase()}
											</span>
										{/if}
									</div>
									<div class="space-y-1">
										<p class="font-semibold leading-none">{tech.name}</p>
										<p class="text-sm text-muted-foreground">
											{$_('home.tech.usedInProjects', { values: { count: tech.projects.length } })}
										</p>
									</div>
								</div>
							</HoverCard.Content>
						</HoverCard.Root>

						<Sheet.Content side="right" class="w-full max-w-md border-border">
							<Sheet.Header>
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card">
										{#if tech.icon_url}
											<img src={tech.icon_url} alt={tech.name} class="h-6 w-6 object-contain" loading="lazy" />
										{:else}
											<span class="text-sm font-semibold text-muted-foreground">
												{tech.name.slice(0, 1).toUpperCase()}
											</span>
										{/if}
									</div>
									<div class="space-y-1">
										<Sheet.Title>{tech.name}</Sheet.Title>
										<Sheet.Description>
											{$_('home.tech.projectsUsingTech', { values: { count: tech.projects.length } })}
										</Sheet.Description>
									</div>
								</div>
							</Sheet.Header>
							<div class="space-y-2 px-4 pb-4">
								{#if tech.projects.length > 0}
									{#each tech.projects as project (project.id)}
										<ProjectCard
											project={project}
											href={`/project/${project.slug}`}
											compact={true}
										/>
									{/each}
								{:else}
									<p class="text-sm text-muted-foreground">{$_('home.tech.noLinkedProjects')}</p>
								{/if}
							</div>
						</Sheet.Content>
					</Sheet.Root>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Experiences -->
<section class="py-2">
	<div class="flex items-center gap-2 mb-6">
		<ArrowDownNarrowWide class="h-5 w-5 text-muted-foreground" />
		<h2 class="text-sm font-medium text-muted-foreground tracking-wide uppercase">
			{$_('home.sections.experiences.title')}
		</h2>
	</div>
	<div class="space-y-4">
		{#each experiences as experience (experience.organization + experience.period)}
			<Experience {experience} />
		{/each}
	</div>
</section>

<!-- Projects -->
{#if data.projects.length > 0}
	<section class="py-2">
		<div class="flex items-center gap-2 mb-6">
			<Folder class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-sm font-medium text-muted-foreground tracking-wide uppercase">
				{$_('home.sections.projects')}
			</h2>
		</div>
		<div class="grid gap-4 md:grid-cols-2">
			{#each projectsWithTechMeta as project (project.id)}
				<ProjectCard project={project} href={`/project/${project.slug}`} />
			{/each}
		</div>
	</section>
{:else if !data.error}
	<!-- Empty State -->
	<section class="py-8 border-t border-border">
		<div class="flex items-center gap-2 mb-6">
			<Folder class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-sm font-medium text-muted-foreground tracking-wide uppercase">
				{$_('home.sections.projects')}
			</h2>
		</div>
		<div class="p-8 text-center border border-dashed border-border rounded-lg">
			<p class="text-muted-foreground">{$_('home.empty.noProjects')}</p>
		</div>
	</section>
{/if}