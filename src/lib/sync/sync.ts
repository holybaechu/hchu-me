import { Client as NotionClient, type PageObjectResponse } from '@notionhq/client';
import type {
	BlogSyncResult,
	BlogWithContent,
	ProjectWithContent,
	SyncResult,
	TechLookupItem
} from './types';
import { NOTION_PROP_STATUS, NOTION_PROP_STATUS_DONE } from '..';
import {
	extractBlogData,
	extractProjectData,
	fetchAllDataSourcePages,
	fetchTechNames
} from './notion';
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

async function resolvePageContent(
	notion: NotionClient,
	pageId: string,
	getStoredContent: () => Promise<string>,
	shouldRefreshContent: boolean
): Promise<string> {
	const storedContent = await getStoredContent();

	if (!shouldRefreshContent && storedContent !== undefined && storedContent !== null) {
		return storedContent;
	}

	const fetchedContent = (await notion.pages.retrieveMarkdown({ page_id: pageId })).markdown;

	return fetchedContent !== undefined && fetchedContent !== null ? fetchedContent : storedContent;
}

export async function syncProject(
	notion: NotionClient,
	db: D1Database,
	page: PageObjectResponse,
	techs: Map<string, TechLookupItem>,
	lastSyncTime?: string
): Promise<SyncResult> {
	const projectData = extractProjectData(page);
	if (!projectData) return { projectData: null };

	const shouldRefreshContent =
		!lastSyncTime || new Date(projectData.lastEditedTime) >= new Date(lastSyncTime);
	const content = await resolvePageContent(
		notion,
		page.id,
		() => getProjectContent(db, page.id),
		shouldRefreshContent
	);

	const project: ProjectWithContent = {
		...projectData,
		content
	};

	const rewriteRelations = shouldRefreshContent;
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

	const shouldRefreshContent =
		!lastSyncTime || new Date(blogData.lastEditedTime) >= new Date(lastSyncTime);
	const content = await resolvePageContent(
		notion,
		page.id,
		() => getBlogContent(db, page.id),
		shouldRefreshContent
	);

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

	for (const page of projectPages) {
		notionProjectIds.add(page.id);
		const { projectData } = await syncProject(notion, DB, page, techs, lastSyncTime);
		if (projectData) {
			syncedProjectCount++;
		}
	}

	const blogPages = await fetchAllDataSourcePages(notion, NOTION_BLOGS_DATA_SOURCE_ID, {
		property: NOTION_PROP_STATUS,
		status: { equals: NOTION_PROP_STATUS_DONE }
	});
	const notionBlogIds = new Set<string>();
	let syncedBlogCount = 0;

	for (const page of blogPages) {
		notionBlogIds.add(page.id);
		const { blogData } = await syncBlog(notion, DB, page, lastSyncTime);
		if (blogData) {
			syncedBlogCount++;
		}
	}

	const deletedProjectCount = await cleanupDeletedProjects(DB, notionProjectIds);
	const deletedTechCount = await cleanupDeletedTechs(DB, notionTechIds);
	const deletedBlogCount = await cleanupDeletedBlogs(DB, notionBlogIds);

	const syncTime = new Date();
	syncTime.setMinutes(syncTime.getMinutes() - 1);
	const now = syncTime.toISOString();

	await updateLastSyncTime(DB, now);

	return {
		success: true,
		synced_projects: syncedProjectCount,
		deleted_projects: deletedProjectCount,
		synced_blogs: syncedBlogCount,
		deleted_blogs: deletedBlogCount,
		synced_techs: techs.size,
		deleted_techs: deletedTechCount,
		last_sync: lastSyncTime,
		new_sync: now
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
