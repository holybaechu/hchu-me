<script>
	import Button from "$lib/components/ui/button/button.svelte";
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Sheet from '$lib/components/ui/sheet';
	import ProjectCard from '$lib/components/project-card.svelte';
	import { resolve } from '$app/paths';
	import { Github, Mail, ExternalLink, MapPin, Building2, AlertCircle, Layers, Folder } from '@lucide/svelte';

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
</script>

<svelte:head>
	<title>hchu.me</title>
</svelte:head>

<!-- Hero -->
<section class="py-6 md:py-14">
	<div class="space-y-4">
		<!-- Intro -->
		<div class="space-y-2">
			<h1 class="text-3xl md:text-5xl font-bold leading-tight">
				안녕하세요,<br />
				<span class="text-green-600">풀스택 개발자 배준후</span>입니다.
			</h1>
			<p class="text-lg max-w-2xl leading-relaxed">
				사용자의 모든 접근 방식을 고려하며 시스템의 빈틈을 집요하게 파고드는 것을 좋아합니다.
			</p>
			<div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
				<div class="flex items-center gap-1.5">
					<MapPin class="h-4 w-4" />
					<span>대한민국 경상남도 창원시</span>
				</div>
				<div class="flex items-center gap-1.5">
					<Building2 class="h-4 w-4" />
					<span>경북소프트웨어마이스터고등학교</span>
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
				블로그 보기
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
				<p class="font-medium">오류가 발생했습니다</p>
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
				기술 스택
			</h2>
		</div>
		<div class="overflow-x-auto pb-2">
			<div class="flex w-max items-center gap-3 pr-2">
				{#each techCards as tech (tech.id)}
					<Sheet.Root>
						<HoverCard.Root openDelay={0} closeDelay={0}>
							<HoverCard.Trigger>
								<Sheet.Trigger
									class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card transition-all hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									aria-label={`${tech.name} 기술 상세 보기`}
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
											{tech.projects.length}개 프로젝트에서 사용 중
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
											이 기술을 사용하는 프로젝트 {tech.projects.length}개
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
									<p class="text-sm text-muted-foreground">연결된 프로젝트가 없습니다.</p>
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
<!-- <section class="py-2">
	<div class="flex items-center gap-2 mb-6">
		<ArrowDownNarrowWide class="h-5 w-5 text-muted-foreground" />
		<h2 class="text-sm font-medium text-muted-foreground tracking-wide uppercase">
			경험
		</h2>
	</div>
	<div>

	</div>
</section> -->

<!-- Projects -->
{#if data.projects.length > 0}
	<section class="py-2">
		<div class="flex items-center gap-2 mb-6">
			<Folder class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-sm font-medium text-muted-foreground tracking-wide uppercase">
				프로젝트
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
				프로젝트
			</h2>
		</div>
		<div class="p-8 text-center border border-dashed border-border rounded-lg">
			<p class="text-muted-foreground">프로젝트가 아직 등록되지 않았습니다.</p>
		</div>
	</section>
{/if}