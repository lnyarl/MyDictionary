-- Migration: Create events table for analytics
-- Generated: 2026-01-22

-- =====================================================
-- EVENTS TABLE (Raw events storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    user_id UUID,
    payload JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for events table
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type_created_at ON events(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_payload ON events USING gin(payload);

-- =====================================================
-- EVENT AGGREGATES TABLE (Compressed/aggregated data)
-- =====================================================
CREATE TABLE IF NOT EXISTS event_aggregates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    user_id UUID,
    aggregate_key VARCHAR(255) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    first_occurrence TIMESTAMP NOT NULL,
    last_occurrence TIMESTAMP NOT NULL,
    metadata JSONB DEFAULT '{}',
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_aggregates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_event_aggregates UNIQUE (type, user_id, aggregate_key, period_start)
);

-- Indexes for event_aggregates table
CREATE INDEX IF NOT EXISTS idx_event_aggregates_type ON event_aggregates(type);
CREATE INDEX IF NOT EXISTS idx_event_aggregates_user_id ON event_aggregates(user_id);
CREATE INDEX IF NOT EXISTS idx_event_aggregates_period ON event_aggregates(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_event_aggregates_aggregate_key ON event_aggregates(aggregate_key);

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_event_aggregates_updated_at ON event_aggregates;
CREATE TRIGGER update_event_aggregates_updated_at
    BEFORE UPDATE ON event_aggregates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Documentation
COMMENT ON TABLE events IS 'Stores raw user activity events for analytics';
COMMENT ON COLUMN events.type IS 'Event type (page_view, word_create, etc.)';
COMMENT ON COLUMN events.payload IS 'Event-specific data in JSON format';
COMMENT ON COLUMN events.metadata IS 'Additional metadata (user agent, IP, etc.)';

COMMENT ON TABLE event_aggregates IS 'Stores aggregated/compressed event data for efficient querying';
COMMENT ON COLUMN event_aggregates.aggregate_key IS 'Unique key for aggregation (e.g., page path, word ID)';
COMMENT ON COLUMN event_aggregates.count IS 'Number of occurrences in the period';
COMMENT ON COLUMN event_aggregates.period_start IS 'Start of the aggregation period';
COMMENT ON COLUMN event_aggregates.period_end IS 'End of the aggregation period';
