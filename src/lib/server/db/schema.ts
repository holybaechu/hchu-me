import { index, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable(
	'projects',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		slug: text('slug').notNull(),
		description: text('description'),
		content: text('content').notNull(),
		githubUrl: text('github_url'),
		websiteUrl: text('website_url')
	},
	(table) => [uniqueIndex('projects_slug_unique').on(table.slug)]
);

import type { BlogTagData } from '../../sync/types';
import { sql } from 'drizzle-orm';

export const blogs = sqliteTable(
	'blogs',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		slug: text('slug').notNull(),
		description: text('description'),
		content: text('content').notNull(),
		tags: text('tags', { mode: 'json' }).$type<BlogTagData[]>().default(sql`'[]'`).notNull()
	},
	(table) => [uniqueIndex('blogs_slug_unique').on(table.slug)]
);

export const techs = sqliteTable('techs', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	iconUrl: text('icon_url')
});

export const projectTechs = sqliteTable(
	'project_techs',
	{
		projectId: text('project_id').notNull(),
		techId: text('tech_id').notNull()
	},
	(table) => [
		primaryKey({ columns: [table.projectId, table.techId] }),
		index('idx_project_techs_tech_id').on(table.techId)
	]
);

export const syncMetadata = sqliteTable('sync_metadata', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});
