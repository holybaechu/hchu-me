import {
	NOTION_PROP_TITLE,
	NOTION_PROP_SLUG,
	NOTION_PROP_DESCRIPTION,
	NOTION_PROP_GITHUB,
	NOTION_PROP_WEBSITE,
	NOTION_PROP_TAGS
} from '$lib';
import { Client as NotionClient, type PageObjectResponse } from '@notionhq/client';
import type { BlogData, ProjectData, TechLookupItem } from './types';

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
	const githubProp = props[NOTION_PROP_GITHUB];
	const websiteProp = props[NOTION_PROP_WEBSITE];
	const githubUrl = githubProp?.type === 'url' ? githubProp.url : null;
	const websiteUrl = websiteProp?.type === 'url' ? websiteProp.url : null;

	return {
		id: page.id,
		title,
		slug,
		description,
		githubUrl,
		websiteUrl,
		lastEditedTime: page.last_edited_time
	};
}

export function extractBlogData(page: PageObjectResponse): BlogData | null {
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

	const tagsProp = props[NOTION_PROP_TAGS];
	const tags =
		tagsProp?.type === 'multi_select'
			? tagsProp.multi_select.map((tag) => ({
					id: tag.id,
					name: tag.name,
					color: tag.color
				}))
			: [];

	return {
		id: page.id,
		title,
		slug,
		description,
		tags,
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

export async function fetchTechNames(
	notion: NotionClient,
	techDataSourceId: string
): Promise<Map<string, TechLookupItem>> {
	const techs = new Map<string, TechLookupItem>();
	const pages = await fetchAllDataSourcePages(notion, techDataSourceId);

	for (const page of pages) {
		if (!('properties' in page)) continue;

		const nameProp = page.properties[NOTION_PROP_TITLE];
		const name =
			nameProp?.type === 'title' ? nameProp.title.map((t) => t.plain_text).join('') : 'Unknown';

		let iconUrl: string | null = null;
		if (page.icon?.type === 'external') {
			iconUrl = page.icon.external.url;
		} else if (page.icon?.type === 'file') {
			iconUrl = page.icon.file.url;
		}

		techs.set(page.id, { name, iconUrl });
	}

	return techs;
}
