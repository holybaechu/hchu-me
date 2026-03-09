CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, -- Notion page ID
    title TEXT NOT NULL, -- 프로젝트 제목
    slug TEXT UNIQUE NOT NULL, -- URL slug
    description TEXT, -- 간단한 프로젝트 설명
    content TEXT NOT NULL -- Markdown 프로젝트 내용
);

CREATE TABLE IF NOT EXISTS tech_stacks (
    id TEXT PRIMARY KEY, -- Notion page ID
    name TEXT NOT NULL UNIQUE, -- 기술 이름 (예: SvelteKit, Rust)
    icon_url TEXT -- 아이콘 이미지 경로
);

CREATE TABLE IF NOT EXISTS project_techs (
    project_id TEXT NOT NULL,
    tech_id TEXT NOT NULL,
    PRIMARY KEY (project_id, tech_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (tech_id) REFERENCES tech_stacks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_project_techs_tech_id ON project_techs(tech_id);