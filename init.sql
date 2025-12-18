-- Enable PostGIS extension for geometry support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum type for seenStatus
CREATE TYPE seen_status_enum AS ENUM ('Seen', 'Partial Seen', 'Not Seen');

-- Create Groups table
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    group_display_name VARCHAR(255) NOT NULL,
    group_default_refresh_seconds INTEGER NOT NULL
);

-- Create Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    user_display_name VARCHAR(255) NOT NULL,
    group_id INTEGER NOT NULL,
    CONSTRAINT fk_user_group FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);

-- Create Sites table
CREATE TABLE sites (
    site_id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL UNIQUE,
    site_display_name VARCHAR(255) NOT NULL,
    site_group_id INTEGER NOT NULL,
    site_user_id INTEGER NOT NULL,
    refresh_seconds INTEGER,
    geometry GEOMETRY(POLYGON, 4326),
    CONSTRAINT fk_site_group FOREIGN KEY (site_group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    CONSTRAINT fk_site_user FOREIGN KEY (site_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Statuses table
CREATE TABLE statuses (
    status_id SERIAL PRIMARY KEY,
    site_id INTEGER NOT NULL,
    seen_status seen_status_enum NOT NULL,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    window_start_time TIMESTAMP NOT NULL,
    CONSTRAINT fk_status_site FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE,
    CONSTRAINT unique_site_window UNIQUE (site_id, window_start_time)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_sites_group_id ON sites(site_group_id);
CREATE INDEX idx_sites_user_id ON sites(site_user_id);
CREATE INDEX idx_statuses_site_id ON statuses(site_id);
CREATE INDEX idx_statuses_time ON statuses(time);
CREATE INDEX idx_statuses_site_window ON statuses(site_id, window_start_time);
CREATE INDEX idx_sites_geometry ON sites USING GIST (geometry);

-- Create role for PostgREST anonymous access
CREATE ROLE web_anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO web_anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO web_anon;

-- Create role for PostgREST authenticated access (if needed later)
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'authenticator_password';
GRANT web_anon TO authenticator;

-- Insert sample data

-- Insert Groups
INSERT INTO groups (group_name, group_display_name, group_default_refresh_seconds) VALUES
('north_region', 'North Region', 300),
('south_region', 'South Region', 600),
('east_region', 'East Region', 420),
('west_region', 'West Region', 360);

-- Insert Users
INSERT INTO users (username, user_display_name, group_id) VALUES
('john.doe', 'John Doe', 1),
('jane.smith', 'Jane Smith', 1),
('bob.johnson', 'Bob Johnson', 2),
('alice.williams', 'Alice Williams', 2),
('charlie.brown', 'Charlie Brown', 3),
('diana.prince', 'Diana Prince', 4);

-- Insert Sites with geometry polygons
INSERT INTO sites (site_name, site_display_name, site_group_id, site_user_id, refresh_seconds, geometry) VALUES
('site_001', 'Downtown Office Building', 1, 1, 300, ST_GeomFromText('POLYGON((-74.0060 40.7128, -74.0050 40.7128, -74.0050 40.7138, -74.0060 40.7138, -74.0060 40.7128))', 4326)),
('site_002', 'Central Park Area', 1, 2, NULL, ST_GeomFromText('POLYGON((-73.9650 40.7829, -73.9550 40.7829, -73.9550 40.7929, -73.9650 40.7929, -73.9650 40.7829))', 4326)),
('site_003', 'Brooklyn Warehouse', 2, 3, 600, ST_GeomFromText('POLYGON((-73.9850 40.6782, -73.9750 40.6782, -73.9750 40.6882, -73.9850 40.6882, -73.9850 40.6782))', 4326)),
('site_004', 'Queens Distribution Center', 2, 4, NULL, ST_GeomFromText('POLYGON((-73.8700 40.7282, -73.8600 40.7282, -73.8600 40.7382, -73.8700 40.7382, -73.8700 40.7282))', 4326)),
('site_005', 'Manhattan Retail Store', 3, 5, 420, ST_GeomFromText('POLYGON((-73.9980 40.7589, -73.9880 40.7589, -73.9880 40.7689, -73.9980 40.7689, -73.9980 40.7589))', 4326)),
('site_006', 'Staten Island Facility', 4, 6, 360, ST_GeomFromText('POLYGON((-74.1500 40.5795, -74.1400 40.5795, -74.1400 40.5895, -74.1500 40.5895, -74.1500 40.5795))', 4326)),
('site_007', 'Bronx Industrial Complex', 1, 1, NULL, ST_GeomFromText('POLYGON((-73.9200 40.8448, -73.9100 40.8448, -73.9100 40.8548, -73.9200 40.8548, -73.9200 40.8448))', 4326)),
('site_008', 'Long Island Office Park', 3, 5, 420, ST_GeomFromText('POLYGON((-73.6000 40.8176, -73.5900 40.8176, -73.5900 40.8276, -73.6000 40.8276, -73.6000 40.8176))', 4326));

-- Statuses table is ready for use
-- Time windows are now calculated using relative anchor (midnight of current day)
-- Window start times are calculated dynamically based on the refresh_seconds and current timestamp
-- No sample status data is inserted as windows are calculated relative to "now"

