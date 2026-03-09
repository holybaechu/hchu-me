export type ProjectData = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	lastEditedTime: string;
};

export type ProjectWithContent = ProjectData & { content: string };

export type SyncResult = {
	projectData: ProjectWithContent | null;
	statements: D1PreparedStatement[];
};

export type TechStackData = {
	id: string;
	name: string;
	projectIds: string[];
};
