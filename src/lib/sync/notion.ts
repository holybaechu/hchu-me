import { NOTION_PROP_TITLE, NOTION_PROP_SLUG, NOTION_PROP_DESCRIPTION } from '$lib';
import { Client as NotionClient, type PageObjectResponse } from '@notionhq/client';
import type { ProjectData } from './types';

type DataSourceQueryArgs = Parameters<NotionClient['dataSources']['query']>[0];

export function extractProjectData(page: PageObjectResponse): ProjectData | null {
	if (!('properties' in page)) {
		return null;
	}

	const props = page.properties;

	const titleProp = props[NOTION_PROP_TITLE];
	const title =
		titleProp?.type === 'title' ? titleProp.title.map((t) => t.plain_text).join('') : 'Untitled';

	const slugProp = props[NOTION_PROP_SLUG];
	const slug =
		slugProp?.type === 'rich_text' && slugProp.rich_text.length > 0
			? slugProp.rich_text.map((t) => t.plain_text).join('')
			: page.id;

	const descProp = props[NOTION_PROP_DESCRIPTION];
	const description =
		descProp?.type === 'rich_text' ? descProp.rich_text.map((t) => t.plain_text).join('') : null;

	return {
		id: page.id,
		title,
		slug,
		description,
		lastEditedTime: page.last_edited_time
	};
}

export async function fetchAllDataSourcePages(
	notion: NotionClient,
	dataSourceId: string,
	filter?: DataSourceQueryArgs['filter']
): Promise<PageObjectResponse[]> {
	const pages: PageObjectResponse[] = [];
	let startCursor: string | undefined;

	do {
		const response = await notion.dataSources.query({
			data_source_id: dataSourceId,
			filter,
			start_cursor: startCursor
		});

		pages.push(...(response.results as PageObjectResponse[]));
		startCursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
	} while (startCursor);

	return pages;
}

export async function fetchTechStackNames(
	notion: NotionClient,
	techStacksDataSourceId: string
): Promise<Map<string, string>> {
	const names = new Map<string, string>();
	const pages = await fetchAllDataSourcePages(notion, techStacksDataSourceId);

	for (const page of pages) {
		if (!('properties' in page)) continue;

		const nameProp = page.properties[NOTION_PROP_TITLE];
		const name =
			nameProp?.type === 'title' ? nameProp.title.map((t) => t.plain_text).join('') : 'Unknown';

		names.set(page.id, name);
	}

	return names;
}
