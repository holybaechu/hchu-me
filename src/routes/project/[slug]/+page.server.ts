import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db/client';
import { projectTechs, projects, techs } from '$lib/server/db/schema';

interface LoadResult {
	project: {
		id: string;
		title: string;
		slug: string;
		description: string | null;
		content: string;
		github_url: string | null;
		website_url: string | null;
		techs: { name: string; icon_url: string | null }[];
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
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				description: projects.description,
				content: projects.content,
				github_url: projects.githubUrl,
				website_url: projects.websiteUrl
			})
			.from(projects)
			.where(eq(projects.slug, slug))
			.limit(1);

		const project = result[0];
		if (!project) {
			throw error(404, 'Project not found.');
		}

		const renderedContent = await marked.parse(project.content || '', {
			gfm: true,
			breaks: true
		});
		const projectTechRows = await db
			.select({
				name: techs.name,
				icon_url: techs.iconUrl
			})
			.from(projectTechs)
			.innerJoin(techs, eq(projectTechs.techId, techs.id))
			.where(eq(projectTechs.projectId, project.id))
			.orderBy(techs.name);

		return {
			project: {
				id: project.id,
				title: project.title,
				slug: project.slug,
				description: project.description,
				content: renderedContent,
				github_url: project.github_url,
				website_url: project.website_url,
				techs: projectTechRows
			}
		} satisfies LoadResult;
	} catch (err) {
		console.error('Failed to load project:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load project.');
	}
};
