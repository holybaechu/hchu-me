<script lang="ts">
	import { page } from '$app/state';
	import { SITE_URL } from '$lib/constants';
	import * as m from '$lib/paraglide/messages.js';

	let {
		title = m.site_title(),
		description = m.home_hero_description(),
		type = 'website',
	} = $props<{
		title?: string;
		description?: string;
		type?: 'website' | 'article';
	}>();

	const url = $derived(`${SITE_URL}${page.url.pathname}`);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={url} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />

	<!-- Canonical Link -->
	<link rel="canonical" href={url} />
</svelte:head>
