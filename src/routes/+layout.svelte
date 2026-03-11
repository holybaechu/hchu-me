<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/i18n';
	import { Button } from '$lib/components/ui/button';
	import { toggleMode, ModeWatcher } from 'mode-watcher';
	import { Moon, Sun } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />
<div class="mx-auto w-full max-w-7xl px-4">
	<header class="flex w-full items-center justify-between py-5">
		<div class="flex gap-1">
			<Button href="/" variant="ghost" class="font-bold">hchu.me</Button>
			<Button href="/blog" variant="ghost">{$_('layout.nav.blog')}</Button>
		</div>
		<Button onclick={toggleMode} variant="ghost" size="icon">
			<Sun
			class="h-full w-full scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
			/>
			<Moon
			class="absolute h-full w-full scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
			/>
      </Button>
	</header>

	<div class="px-4">
		{@render children()}
	</div>
</div>
