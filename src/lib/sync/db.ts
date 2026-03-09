import { NOTION_PROP_TECH_STACK } from '..';
import type { PageObjectResponse } from '@notionhq/client';
import type { ProjectWithContent } from './types';

export async function getLastSyncTime(db: D1Database): Promise<string | undefined> {
	const result = await db
		.prepare("SELECT value FROM sync_metadata WHERE key = 'last_sync'")
		.first<{ value: string }>();
	return result?.value;
}

export async function updateLastSyncTime(db: D1Database, timestamp: string): Promise<void> {
	await db
		.prepare(
			`
            INSERT INTO sync_metadata (key, value)
            VALUES ('last_sync', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `
		)
		.bind(timestamp)
		.run();
}

export async function buildProjectStatements(
	db: D1Database,
	project: ProjectWithContent,
	options?: { rewriteRelations?: boolean }
): Promise<D1PreparedStatement[]> {
	const statements: D1PreparedStatement[] = [];
	const rewriteRelations = options?.rewriteRelations ?? true;

	statements.push(
		db
			.prepare(
				`
            INSERT INTO projects (id, title, slug, description, content)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title=excluded.title,
                slug=excluded.slug,
                description=excluded.description,
                content=excluded.content
        `
			)
			.bind(project.id, project.title, project.slug, project.description, project.content)
	);

	if (rewriteRelations) {
		statements.push(db.prepare(`DELETE FROM project_techs WHERE project_id = ?`).bind(project.id));
	}

	return statements;
}

export function buildTechStackStatements(
	db: D1Database,
	page: PageObjectResponse,
	projectId: string,
	techStackNames: Map<string, string>
): D1PreparedStatement[] {
	const statements: D1PreparedStatement[] = [];
	const techStackProp = page.properties[NOTION_PROP_TECH_STACK];

	if (techStackProp?.type === 'relation') {
		for (const relation of techStackProp.relation) {
			const techName = techStackNames.get(relation.id) || `Unknown (${relation.id})`;

			statements.push(
				db
					.prepare(
						`
                    INSERT INTO tech_stacks (id, name)
                    VALUES (?, ?)
                    ON CONFLICT(id) DO UPDATE SET name = excluded.name
                `
					)
					.bind(relation.id, techName)
			);

			statements.push(
				db
					.prepare(
						`
                    INSERT INTO project_techs (project_id, tech_id)
                    VALUES (?, ?)
                `
					)
					.bind(projectId, relation.id)
			);
		}
	}

	return statements;
}

export async function cleanupDeletedProjects(
	db: D1Database,
	notionProjectIds: Set<string>
): Promise<number> {
	const dbProjects = await db.prepare('SELECT id FROM projects').all<{ id: string }>();
	const dbProjectIds = dbProjects.results ?? [];
	const idsToDelete: string[] = [];

	for (const { id } of dbProjectIds) {
		if (!notionProjectIds.has(id)) {
			idsToDelete.push(id);
		}
	}

	if (idsToDelete.length === 0) {
		return 0;
	}

	const chunkSize = 50;
	for (let i = 0; i < idsToDelete.length; i += chunkSize) {
		const chunk = idsToDelete.slice(i, i + chunkSize);
		const placeholders = chunk.map(() => '?').join(', ');
		await db
			.prepare(`DELETE FROM projects WHERE id IN (${placeholders})`)
			.bind(...chunk)
			.run();
	}

	return idsToDelete.length;
}
