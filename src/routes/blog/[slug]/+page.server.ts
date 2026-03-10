import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db/client';
import { blogs } from '$lib/server/db/schema';

interface LoadResult {
	blog: {
		id: string;
		title: string;
		slug: string;
		description: string | null;
		content: string;
	};
}

export const load: PageServerLoad = async ({ params, platform }) => {
	const { slug } = params;
	const d1 = platform?.env?.DB;

	if (!d1) {
		throw error(500, 'Database not connected.');
	}

	const db = getDb(d1);

	try {
		const result = await db
			.select({
				id: blogs.id,
				title: blogs.title,
				slug: blogs.slug,
				description: blogs.description,
				content: blogs.content
			})
			.from(blogs)
			.where(eq(blogs.slug, slug))
			.limit(1);

		const blog = result[0];
		if (!blog) {
			throw error(404, 'Blog not found.');
		}

		const renderedContent = await marked(blog.content || '');

		return {
			blog: {
				id: blog.id,
				title: blog.title,
				slug: blog.slug,
				description: blog.description,
				content: renderedContent
			}
		} satisfies LoadResult;
	} catch (err) {
		console.error('Failed to load blog:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load blog.');
	}
};
