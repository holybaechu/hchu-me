<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, locales, localizeHref, setLocale } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { toggleMode, ModeWatcher } from 'mode-watcher';
	import { Languages, Moon, Sun } from '@lucide/svelte';

	let { children } = $props();

	const localeNames: Record<string, string> = {
		ko: '한국어',
		en: 'English'
	};

	type AppLocale = (typeof locales)[number];

	let currentLocale = $state<AppLocale>(getLocale());

	const changeLocale = (locale: AppLocale) => {
		setLocale(locale);
		currentLocale = locale;
		window.location.href = localizeHref(`${page.url.pathname}${page.url.search}`, { locale });
	};
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />

<div class="mx-auto w-full max-w-7xl px-4">
	<header class="flex w-full items-center justify-between py-5">
		<div class="flex gap-1">
			<Button href="/" variant="ghost" class="font-bold bg-linear-to-r from-blue-300 to-green-600 bg-clip-text text-transparent">hchu.me</Button>
			<Button href="/blog" variant="ghost">{m.layout_nav_blog()}</Button>
		</div>

		<div class="flex items-center gap-1">
			<DropdownMenu>
				<DropdownMenuTrigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
					<Languages />
					{localeNames[currentLocale] ?? currentLocale.toUpperCase()}
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{#each locales as locale (locale)}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<DropdownMenuItem
							disabled={locale === currentLocale}
							onclick={() => changeLocale(locale)}
						>
							{localeNames[locale] ?? locale.toUpperCase()}
						</DropdownMenuItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenu>

			<Button onclick={toggleMode} variant="ghost" size="icon">
				<Sun class="h-full w-full scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90" />

				<Moon
					class="absolute h-full w-full scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
			</Button>
		</div>
	</header>

	<div class="px-4">{@render children()}</div>
</div>
