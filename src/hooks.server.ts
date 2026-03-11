import { syncAll } from '$lib';
import '$lib/i18n';
import type { Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get('accept-language')?.split(',')[0]?.split('-')[0];
	locale.set(lang || 'ko');
	return resolve(event);
};

export const scheduled = async (_event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
	console.log('Starting scheduled sync...');

	ctx.waitUntil(
		syncAll(env)
			.then((result) => {
				console.log('Scheduled sync completed successfully:', result);
			})
			.catch((error) => {
				console.error('Scheduled sync failed:', error);
			})
	);
};
