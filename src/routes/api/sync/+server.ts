import { syncAll } from '$lib/sync/sync';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ platform, request }: RequestEvent) => {
	if (!platform?.env) {
		return new Response('Platform environment not found', { status: 500 });
	}

	const { SYNC_SECRET } = platform.env;
	const authHeader = request.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
	}

	const token = authHeader.split(' ')[1];
	if (token !== SYNC_SECRET) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
	}

	try {
		const result = await syncAll(platform.env);

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Sync failed:', error);
		return new Response(
			JSON.stringify({
				error: 'Sync failed',
				details: error instanceof Error ? error.message : String(error)
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
