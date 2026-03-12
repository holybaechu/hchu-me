import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { syncAll } from '$lib';
import type { Handle } from '@sveltejs/kit';

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

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle = handleParaglide;
