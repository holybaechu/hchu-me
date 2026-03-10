import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { blogs } from '$lib/server/db/schema';

interface BlogItem {
	id: string;
	title: string;
	slug: string;
	description: string | null;
}

interface LoadResult {
	blogs: BlogItem[];
	error?: string;
}

export const load: PageServerLoad = async ({ platform }) => {
	const d1 = platform?.env?.DB;

	if (!d1) {
		return {
			blogs: [],
			error: 'Database not connected.'
		} satisfies LoadResult;
	}

	const db = getDb(d1);

	try {
		const blogRows = await db
			.select({
				id: blogs.id,
				title: blogs.title,
				slug: blogs.slug,
				description: blogs.description
			})
			.from(blogs)
			.orderBy(blogs.title);

		return {
			blogs: blogRows
		} satisfies LoadResult;
	} catch (err) {
		console.error('Failed to load blogs:', err);
		return {
			blogs: [],
			error: 'Failed to load blogs.'
		} satisfies LoadResult;
	}
};
