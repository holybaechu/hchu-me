// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Env {
		SYNC_SECRET: string;
		NOTION_TOKEN: string;
		NOTION_PROJECTS_DATA_SOURCE_ID: string;
		NOTION_BLOGS_DATA_SOURCE_ID: string;
		NOTION_TECHS_DATA_SOURCE_ID: string;
		DB: D1Database;
	}

	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
