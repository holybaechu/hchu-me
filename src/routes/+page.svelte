<script>
	export let data;
</script>

<h1>Projects</h1>

<ul>
	{#each data.projects as project (project.id)}
		<li>
			<h2>{project.title}</h2>
			{#if project.description}
				<p>{project.description}</p>
			{/if}
			{#if project.tech_stacks.length > 0}
				<p>Tech: {project.tech_stacks.join(', ')}</p>
			{/if}
			<small>Slug: {project.slug}</small>
		</li>
	{/each}
</ul>
