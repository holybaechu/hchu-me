import { Client as NotionClient, type PageObjectResponse } from '@notionhq/client';
import type {
	BlogSyncResult,
	BlogWithContent,
	ProjectWithContent,
	SyncResult,
	TechLookupItem
} from './types';
import { NOTION_PROP_STATUS, NOTION_PROP_STATUS_DONE } from '..';
import { extractBlogData, extractProjectData, fetchAllDataSourcePages, fetchTechNames } from './notion';
import {
	cleanupDeletedBlogs,
	cleanupDeletedTechs,
	cleanupDeletedProjects,
	getBlogContent,
	getLastSyncTime,
	getProjectContent,
	upsertAllTechs,
	upsertBlog,
	upsertProject,
	upsertProjectTechs,
	updateLastSyncTime
} from './db';

export async function syncProject(
	notion: NotionClient,
	db: D1Database,
	page: PageObjectResponse,
	techs: Map<string, TechLookupItem>,
	lastSyncTime?: string
): Promise<SyncResult> {
	const projectData = extractProjectData(page);
	if (!projectData) return { projectData: null };

	let content: string;
	const shouldFetchFreshContent =
		!lastSyncTime || new Date(projectData.lastEditedTime) >= new Date(lastSyncTime);
	if (shouldFetchFreshContent) {
		content = (await notion.pages.retrieveMarkdown({ page_id: page.id })).markdown;
	} else {
		content = await getProjectContent(db, page.id);
		if (content === '') {
			content = (await notion.pages.retrieveMarkdown({ page_id: page.id })).markdown;
		}
	}

	const project: ProjectWithContent = {
		...projectData,
		content
	};

	const rewriteRelations = !lastSyncTime || new Date(projectData.lastEditedTime) >= new Date(lastSyncTime);
	await upsertProject(db, project, { rewriteRelations });

	if (rewriteRelations) {
		await upsertProjectTechs(db, page, project.id, techs);
	}

	return { projectData: project };
}

export async function syncBlog(
	notion: NotionClient,
	db: D1Database,
	page: PageObjectResponse,
	lastSyncTime?: string
): Promise<BlogSyncResult> {
	const blogData = extractBlogData(page);
	if (!blogData) return { blogData: null };

	let content: string;
	const shouldFetchFreshContent =
		!lastSyncTime || new Date(blogData.lastEditedTime) >= new Date(lastSyncTime);
	if (shouldFetchFreshContent) {
		content = (await notion.pages.retrieveMarkdown({ page_id: page.id })).markdown;
	} else {
		content = await getBlogContent(db, page.id);
	}

	const blog: BlogWithContent = {
		...blogData,
		content
	};

	await upsertBlog(db, blog);

	return { blogData: blog };
}

export async function syncAll(env: App.Platform['env']) {
	const {
		NOTION_TOKEN,
		NOTION_PROJECTS_DATA_SOURCE_ID,
		NOTION_BLOGS_DATA_SOURCE_ID,
		NOTION_TECHS_DATA_SOURCE_ID,
		DB
	} = env;

	const runStartedAt = new Date().toISOString();
	const lastSyncTime = await getLastSyncTime(DB);

	const notion = new NotionClient({
		auth: NOTION_TOKEN,
		fetch: fetch.bind(globalThis)
	});

	const techs = await fetchTechNames(notion, NOTION_TECHS_DATA_SOURCE_ID);
	const notionTechIds = new Set(techs.keys());

	await upsertAllTechs(DB, techs);

	const projectPages = await fetchAllDataSourcePages(notion, NOTION_PROJECTS_DATA_SOURCE_ID, {
		property: NOTION_PROP_STATUS,
		status: { equals: NOTION_PROP_STATUS_DONE }
	});
	const notionProjectIds = new Set<string>();
	let syncedProjectCount = 0;
	let failedProjectCount = 0;
	const projectErrors: { id: string; message: string }[] = [];

	for (const page of projectPages) {
		notionProjectIds.add(page.id);
		try {
			const { projectData } = await syncProject(notion, DB, page, techs, lastSyncTime);
			if (projectData) {
				syncedProjectCount++;
			}
		} catch (error) {
			failedProjectCount++;
			projectErrors.push({
				id: page.id,
				message: error instanceof Error ? error.message : String(error)
			});
			console.error(`Project sync failed for page ${page.id}:`, error);
		}
	}

	const blogPages = await fetchAllDataSourcePages(notion, NOTION_BLOGS_DATA_SOURCE_ID, {
		property: NOTION_PROP_STATUS,
		status: { equals: NOTION_PROP_STATUS_DONE }
	});
	const notionBlogIds = new Set<string>();
	let syncedBlogCount = 0;
	let failedBlogCount = 0;
	const blogErrors: { id: string; message: string }[] = [];

	for (const page of blogPages) {
		notionBlogIds.add(page.id);
		try {
			const { blogData } = await syncBlog(notion, DB, page, lastSyncTime);
			if (blogData) {
				syncedBlogCount++;
			}
		} catch (error) {
			failedBlogCount++;
			blogErrors.push({
				id: page.id,
				message: error instanceof Error ? error.message : String(error)
			});
			console.error(`Blog sync failed for page ${page.id}:`, error);
		}
	}

	const deletedProjectCount = await cleanupDeletedProjects(DB, notionProjectIds);
	const deletedTechCount = await cleanupDeletedTechs(DB, notionTechIds);
	const deletedBlogCount = await cleanupDeletedBlogs(DB, notionBlogIds);

	await updateLastSyncTime(DB, runStartedAt);

	return {
		success: true,
		synced_projects: syncedProjectCount,
		failed_projects: failedProjectCount,
		deleted_projects: deletedProjectCount,
		synced_blogs: syncedBlogCount,
		failed_blogs: failedBlogCount,
		deleted_blogs: deletedBlogCount,
		synced_techs: techs.size,
		deleted_techs: deletedTechCount,
		last_sync: lastSyncTime,
		new_sync: runStartedAt,
		errors: {
			projects: projectErrors,
			blogs: blogErrors
		}
	};
}

export { extractBlogData, extractProjectData, fetchTechNames } from './notion';
export {
	getLastSyncTime,
	updateLastSyncTime,
	upsertProject,
	upsertProjectTechs,
	upsertAllTechs,
	getProjectContent,
	upsertBlog,
	getBlogContent,
	cleanupDeletedBlogs,
	cleanupDeletedTechs,
	cleanupDeletedProjects
} from './db';
export type {
	BlogData,
	BlogWithContent,
	BlogSyncResult,
	ProjectData,
	ProjectWithContent,
	SyncResult,
	TechData
} from './types';
