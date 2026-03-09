import { Client as NotionClient, type PageObjectResponse } from '@notionhq/client';
import type { ProjectWithContent, SyncResult } from './types';
import { NOTION_PROP_STATUS, NOTION_PROP_STATUS_DONE } from '..';
import { extractProjectData, fetchAllDataSourcePages, fetchTechStackNames } from './notion';
import {
	buildProjectStatements,
	buildTechStackStatements,
	cleanupDeletedProjects,
	getLastSyncTime,
	updateLastSyncTime
} from './db';

export async function syncProject(
	notion: NotionClient,
	db: D1Database,
	page: PageObjectResponse,
	techStackNames: Map<string, string>,
	lastSyncTime?: string
): Promise<SyncResult> {
	const projectData = extractProjectData(page);
	if (!projectData) {
		return { projectData: null, statements: [] };
	}

	const shouldFetchContent =
		!lastSyncTime || new Date(projectData.lastEditedTime) > new Date(lastSyncTime);

	let content: string;
	if (shouldFetchContent) {
		const contentResponse = await notion.pages.retrieveMarkdown({ page_id: page.id });
		content =
			typeof contentResponse === 'string' ? contentResponse : JSON.stringify(contentResponse);
	} else {
		const existing = await db
			.prepare('SELECT content FROM projects WHERE id = ?')
			.bind(page.id)
			.first<{ content: string }>();
		content = existing?.content ?? '';
	}

	const project: ProjectWithContent = {
		...projectData,
		content
	};

	const rewriteRelations = shouldFetchContent;
	const statements = await buildProjectStatements(db, project, { rewriteRelations });

	if (rewriteRelations) {
		const techStatements = buildTechStackStatements(db, page, project.id, techStackNames);
		statements.push(...techStatements);
	}

	return { projectData: project, statements };
}

export async function syncAll(env: App.Platform['env']) {
	const { NOTION_TOKEN, NOTION_PROJECTS_DATA_SOURCE_ID, NOTION_TECH_STACKS_DATA_SOURCE_ID, DB } =
		env;

	const lastSyncTime = await getLastSyncTime(DB);

	const notion = new NotionClient({
		auth: NOTION_TOKEN,
		fetch: fetch.bind(globalThis)
	});

	const techStackNames = await fetchTechStackNames(notion, NOTION_TECH_STACKS_DATA_SOURCE_ID);

	const results = await fetchAllDataSourcePages(notion, NOTION_PROJECTS_DATA_SOURCE_ID, {
		property: NOTION_PROP_STATUS,
		status: { equals: NOTION_PROP_STATUS_DONE }
	});
	const notionProjectIds = new Set<string>();
	let syncedProjectCount = 0;
	const allStatements: D1PreparedStatement[] = [];

	for (const page of results) {
		notionProjectIds.add(page.id);
		const { projectData, statements } = await syncProject(
			notion,
			DB,
			page,
			techStackNames,
			lastSyncTime
		);
		if (projectData) {
			syncedProjectCount++;
			allStatements.push(...statements);
		}
	}

	if (allStatements.length > 0) {
		const batchChunkSize = 100;
		for (let i = 0; i < allStatements.length; i += batchChunkSize) {
			await DB.batch(allStatements.slice(i, i + batchChunkSize));
		}
	}

	const deletedCount = await cleanupDeletedProjects(DB, notionProjectIds);

	const now = new Date().toISOString();
	await updateLastSyncTime(DB, now);

	return {
		success: true,
		synced_projects: syncedProjectCount,
		deleted_projects: deletedCount,
		synced_tech_stacks: techStackNames.size,
		last_sync: lastSyncTime,
		new_sync: now
	};
}

export { extractProjectData, fetchTechStackNames } from './notion';
export {
	getLastSyncTime,
	updateLastSyncTime,
	buildProjectStatements,
	buildTechStackStatements,
	cleanupDeletedProjects
} from './db';
export type { ProjectData, ProjectWithContent, SyncResult, TechStackData } from './types';
