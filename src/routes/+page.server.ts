import type { PageServerLoad } from './$types';
import { sql } from 'drizzle-orm';
import { getDb } from '$lib/server/db/client';
import { projectTechs, projects, techs } from '$lib/server/db/schema';

interface Tech {
	id: string;
	name: string;
	icon_url: string | null;
}

interface Project {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	content: string;
	github_url: string | null;
	website_url: string | null;
	techs: string[];
}

interface LoadResult {
	projects: Project[];
	techs: Tech[];
	error?: string;
}

export const load: PageServerLoad = async ({ platform }) => {
	const d1 = platform?.env?.DB;
	if (!d1) {
		return {
			projects: [],
			techs: [],
			error: 'Database not connected.'
		} satisfies LoadResult;
	}
	const db = getDb(d1);

	try {
		const techRows = await db.select().from(techs).orderBy(techs.name);
		const techList: Tech[] = techRows.map((t) => ({
			id: t.id,
			name: t.name,
			icon_url: t.iconUrl
		}));
		const rawProjects = await db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				description: projects.description,
				content: projects.content,
				github_url: projects.githubUrl,
				website_url: projects.websiteUrl,
				tech_names: sql<string | null>`GROUP_CONCAT(${techs.name})`
			})
			.from(projects)
			.leftJoin(projectTechs, sql`${projects.id} = ${projectTechs.projectId}`)
			.leftJoin(techs, sql`${projectTechs.techId} = ${techs.id}`)
			.groupBy(projects.id)
			.orderBy(projects.title);

		if (rawProjects.length === 0 && techList.length === 0) {
			return {
				projects: [],
				techs: [],
				error: 'No data found. Please sync with Notion first.'
			} satisfies LoadResult;
		}

		const projectList: Project[] = rawProjects.map((p) => ({
			id: p.id,
			title: p.title,
			slug: p.slug,
			description: p.description,
			content: p.content,
			github_url: p.github_url,
			website_url: p.website_url,
			techs: p.tech_names ? p.tech_names.split(',') : []
		}));

		return {
			projects: projectList,
			techs: techList
		} satisfies LoadResult;
	} catch (err) {
		console.error('Failed to load data from D1:', err);
		return {
			projects: [],
			techs: [],
			error: 'Failed to load data from database.'
		} satisfies LoadResult;
	}
};
