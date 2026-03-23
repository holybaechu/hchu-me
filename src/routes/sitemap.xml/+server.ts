import { SITE_URL } from '$lib';
import { getDb } from '$lib/server/db/client';
import { blogs, projects } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = async ({ platform }) => {
	const d1 = platform?.env?.DB;

	let projectSlugs: string[] = [];
	let blogSlugs: string[] = [];

	if (d1) {
		try {
			const db = getDb(d1);
			const projectRows = await db.select({ slug: projects.slug, id: projects.id }).from(projects);
			const blogRows = await db.select({ slug: blogs.slug, id: blogs.id }).from(blogs);

			projectSlugs = projectRows.map((row) => row.slug || row.id);
			blogSlugs = blogRows.map((row) => row.slug || row.id);
		} catch (err) {
			console.error('Failed to fetch slugs for sitemap', err);
		}
	}

	const pages = [
		'',
		'/blog',
		...projectSlugs.map((slug) => `/project/${slug}`),
		...blogSlugs.map((slug) => `/blog/${slug}`)
	];

	const sitemap = `
		<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
			${pages
				.map(
					(page) => `
				<url>
					<loc>${SITE_URL}${page}</loc>
					<changefreq>daily</changefreq>
					<priority>${page === '' ? '1.0' : '0.8'}</priority>
				</url>
			`
				)
				.join('')}
		</urlset>
	`.trim();

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
