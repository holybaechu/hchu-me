import { browser } from '$app/environment';
import { init, register } from 'svelte-i18n';

const defaultLocale = 'ko';

register('ko', () => import('./locales/ko.json'));

const initialLocale = browser ? window.navigator.language.split('-')[0] : defaultLocale;

init({
	fallbackLocale: defaultLocale,
	initialLocale
});