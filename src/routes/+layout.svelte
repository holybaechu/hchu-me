<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Button } from '$lib/components/ui/button';
	import { toggleMode, ModeWatcher } from 'mode-watcher';
	import { Moon, Sun } from '@lucide/svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />

<div class="mx-auto w-full max-w-7xl px-4">
	<header class="flex w-full items-center justify-between py-5">
		<div class="flex gap-1">
			<Button href="/" variant="ghost" class="font-bold">hchu.me</Button>
			<Button href="/blog" variant="ghost">{m.layout_nav_blog()}</Button>
		</div>

		<Button onclick={toggleMode} variant="ghost" size="icon">
			<Sun class="h-full w-full scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90" />

			<Moon
				class="absolute h-full w-full scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
			/>
		</Button>
	</header>

	<div class="px-4">{@render children()}</div>
</div>

<div style="display:none">
	{#each locales as locale (locale)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={localizeHref(page.url.pathname, { locale })} data-sveltekit-reload>
			{locale}
		</a>
	{/each}
</div>
