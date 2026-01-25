-- Definition Histories Table
-- Stores snapshots of definitions before each update

CREATE TABLE IF NOT EXISTS definition_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    definition_id UUID NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    media_urls JSONB DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_definition_histories_definition FOREIGN KEY (definition_id) REFERENCES definitions(id) ON DELETE CASCADE,
    CONSTRAINT definition_histories_content_length CHECK (length(content) <= 5000)
);

-- Indexes for definition_histories table
CREATE INDEX IF NOT EXISTS idx_definition_histories_definition_id ON definition_histories(definition_id);
CREATE INDEX IF NOT EXISTS idx_definition_histories_created_at ON definition_histories(created_at DESC);


