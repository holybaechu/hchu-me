import { NOTION_PROP_TECH_STACK } from '..';
import type { PageObjectResponse } from '@notionhq/client';
import { eq, inArray } from 'drizzle-orm';
import { getDb } from '$lib/server/db/client';
import { blogs, projectTechs, projects, syncMetadata, techs } from '$lib/server/db/schema';
import type { BlogWithContent, ProjectWithContent, TechLookupItem } from './types';

export async function getLastSyncTime(db: D1Database): Promise<string | undefined> {
	const result = await getDb(db)
		.select({ value: syncMetadata.value })
		.from(syncMetadata)
		.where(eq(syncMetadata.key, 'last_sync'))
		.limit(1);
	return result[0]?.value;
}

export async function updateLastSyncTime(db: D1Database, timestamp: string): Promise<void> {
	await getDb(db)
		.insert(syncMetadata)
		.values({ key: 'last_sync', value: timestamp })
		.onConflictDoUpdate({
			target: syncMetadata.key,
			set: { value: timestamp }
		});
}

export async function upsertProject(
	db: D1Database,
	project: ProjectWithContent,
	options?: { rewriteRelations?: boolean }
): Promise<void> {
	const d = getDb(db);
	const rewriteRelations = options?.rewriteRelations ?? true;

	await d
		.insert(projects)
		.values({
			id: project.id,
			title: project.title,
			slug: project.slug,
			description: project.description,
			content: project.content,
			githubUrl: project.githubUrl,
			websiteUrl: project.websiteUrl
		})
		.onConflictDoUpdate({
			target: projects.id,
			set: {
				title: project.title,
				slug: project.slug,
				description: project.description,
				content: project.content,
				githubUrl: project.githubUrl,
				websiteUrl: project.websiteUrl
			}
		});

	if (rewriteRelations) {
		await d.delete(projectTechs).where(eq(projectTechs.projectId, project.id));
	}
}

export async function upsertAllTechs(
	db: D1Database,
	techMap: Map<string, TechLookupItem>
): Promise<void> {
	const d = getDb(db);
	if (techMap.size === 0) return;

	for (const [id, tech] of techMap) {
		await d
			.insert(techs)
			.values({ id, name: tech.name, iconUrl: tech.iconUrl })
			.onConflictDoUpdate({
				target: techs.id,
				set: { name: tech.name, iconUrl: tech.iconUrl }
			});
	}
}

export async function upsertProjectTechs(
	db: D1Database,
	page: PageObjectResponse,
	projectId: string,
	techMap: Map<string, TechLookupItem>
): Promise<void> {
	const d = getDb(db);
	const techProp = page.properties[NOTION_PROP_TECH_STACK];

	if (techProp?.type !== 'relation') return;

	for (const relation of techProp.relation) {
		const tech = techMap.get(relation.id) ?? {
			name: `Unknown (${relation.id})`,
			iconUrl: null
		};

		await d
			.insert(techs)
			.values({ id: relation.id, name: tech.name, iconUrl: tech.iconUrl })
			.onConflictDoUpdate({
				target: techs.id,
				set: { name: tech.name, iconUrl: tech.iconUrl }
			});

		await d.insert(projectTechs).values({ projectId, techId: relation.id }).onConflictDoNothing();
	}
}

export async function getProjectContent(db: D1Database, projectId: string): Promise<string> {
	const d = getDb(db);
	const result = await d
		.select({ content: projects.content })
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1);
	return result[0]?.content ?? '';
}

export async function upsertBlog(db: D1Database, blog: BlogWithContent): Promise<void> {
	const d = getDb(db);
	await d
		.insert(blogs)
		.values({
			id: blog.id,
			title: blog.title,
			slug: blog.slug,
			description: blog.description,
			content: blog.content
		})
		.onConflictDoUpdate({
			target: blogs.id,
			set: {
				title: blog.title,
				slug: blog.slug,
				description: blog.description,
				content: blog.content
			}
		});
}

export async function getBlogContent(db: D1Database, blogId: string): Promise<string> {
	const d = getDb(db);
	const result = await d
		.select({ content: blogs.content })
		.from(blogs)
		.where(eq(blogs.id, blogId))
		.limit(1);
	return result[0]?.content ?? '';
}

export async function cleanupDeletedProjects(
	db: D1Database,
	notionProjectIds: Set<string>
): Promise<number> {
	const d = getDb(db);
	const dbProjects = await d.select({ id: projects.id }).from(projects);
	const idsToDelete = dbProjects.map((item) => item.id).filter((id) => !notionProjectIds.has(id));

	const chunkSize = 50;
	for (let i = 0; i < idsToDelete.length; i += chunkSize) {
		const chunk = idsToDelete.slice(i, i + chunkSize);
		await d.delete(projects).where(inArray(projects.id, chunk));
	}

	return idsToDelete.length;
}

export async function cleanupDeletedTechs(
	db: D1Database,
	notionTechIds: Set<string>
): Promise<number> {
	const d = getDb(db);
	const dbTechs = await d.select({ id: techs.id }).from(techs);
	const idsToDelete = dbTechs.map((item) => item.id).filter((id) => !notionTechIds.has(id));

	const chunkSize = 50;
	for (let i = 0; i < idsToDelete.length; i += chunkSize) {
		const chunk = idsToDelete.slice(i, i + chunkSize);
		await d.delete(techs).where(inArray(techs.id, chunk));
	}

	return idsToDelete.length;
}

export async function cleanupDeletedBlogs(
	db: D1Database,
	notionBlogIds: Set<string>
): Promise<number> {
	const d = getDb(db);
	const dbBlogs = await d.select({ id: blogs.id }).from(blogs);
	const idsToDelete = dbBlogs.map((item) => item.id).filter((id) => !notionBlogIds.has(id));

	const chunkSize = 50;
	for (let i = 0; i < idsToDelete.length; i += chunkSize) {
		const chunk = idsToDelete.slice(i, i + chunkSize);
		await d.delete(blogs).where(inArray(blogs.id, chunk));
	}

	return idsToDelete.length;
}
