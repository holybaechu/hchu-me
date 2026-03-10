export type ProjectData = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	githubUrl: string | null;
	websiteUrl: string | null;
	lastEditedTime: string;
};

export type ProjectWithContent = ProjectData & { content: string };
export type BlogData = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	lastEditedTime: string;
};
export type BlogWithContent = BlogData & { content: string };

export type SyncResult = {
	projectData: ProjectWithContent | null;
};

export type BlogSyncResult = {
	blogData: BlogWithContent | null;
};

export type TechData = {
	id: string;
	name: string;
	iconUrl: string | null;
	projectIds: string[];
};

export type TechLookupItem = {
	name: string;
	iconUrl: string | null;
};
