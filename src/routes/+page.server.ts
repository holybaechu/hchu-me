export const load = async ({ platform }) => {
	if (!platform?.env) {
		return { projects: [] };
	}

	const { DB } = platform.env;

	const projects = await DB.prepare(
		`
        SELECT 
            p.id, 
            p.title, 
            p.slug, 
            p.description, 
            GROUP_CONCAT(ts.name) as tech_stacks
        FROM projects p
        LEFT JOIN project_techs pt ON p.id = pt.project_id
        LEFT JOIN tech_stacks ts ON pt.tech_id = ts.id
        GROUP BY p.id
    `
	).all();

	const projectsWithTechStacks = (projects.results ?? []).map((p) => ({
		id: p.id,
		title: p.title,
		slug: p.slug,
		description: p.description,
		tech_stacks: (p.tech_stacks as string) ? (p.tech_stacks as string).split(',') : []
	}));

	return { projects: projectsWithTechStacks };
};
