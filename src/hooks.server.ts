import { syncAll } from '$lib';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	return await resolve(event);
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
