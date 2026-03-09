// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Env {
		SYNC_SECRET: string;
		NOTION_TOKEN: string;
		NOTION_PROJECTS_DATA_SOURCE_ID: string;
		NOTION_TECH_STACKS_DATA_SOURCE_ID: string;
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
