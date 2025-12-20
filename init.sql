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
('north_region', 'North Region', 86400),
('south_region', 'South Region', 86400),
('east_region', 'East Region', 86400),
('west_region', 'West Region', 86400);

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
('site_001', 'Downtown Office Building', 1, 1, 86400, ST_GeomFromText('POLYGON((-74.0060 40.7128, -74.0050 40.7128, -74.0050 40.7138, -74.0060 40.7138, -74.0060 40.7128))', 4326)),
('site_002', 'Central Park Area', 1, 2, NULL, ST_GeomFromText('POLYGON((-73.9650 40.7829, -73.9550 40.7829, -73.9550 40.7929, -73.9650 40.7929, -73.9650 40.7829))', 4326)),
('site_003', 'Brooklyn Warehouse', 2, 3, 86400, ST_GeomFromText('POLYGON((-73.9850 40.6782, -73.9750 40.6782, -73.9750 40.6882, -73.9850 40.6882, -73.9850 40.6782))', 4326)),
('site_004', 'Queens Distribution Center', 2, 4, NULL, ST_GeomFromText('POLYGON((-73.8700 40.7282, -73.8600 40.7282, -73.8600 40.7382, -73.8700 40.7382, -73.8700 40.7282))', 4326)),
('site_005', 'Manhattan Retail Store', 3, 5, 86400, ST_GeomFromText('POLYGON((-73.9980 40.7589, -73.9880 40.7589, -73.9880 40.7689, -73.9980 40.7689, -73.9980 40.7589))', 4326)),
('site_006', 'Staten Island Facility', 4, 6, NULL, ST_GeomFromText('POLYGON((-74.1500 40.5795, -74.1400 40.5795, -74.1400 40.5895, -74.1500 40.5895, -74.1500 40.5795))', 4326)),
('site_007', 'Bronx Industrial Complex', 1, 1, 86400, ST_GeomFromText('POLYGON((-73.9200 40.8448, -73.9100 40.8448, -73.9100 40.8548, -73.9200 40.8548, -73.9200 40.8448))', 4326)),
('site_008', 'Long Island Office Park', 3, 5, NULL, ST_GeomFromText('POLYGON((-73.6000 40.8176, -73.5900 40.8176, -73.5900 40.8276, -73.6000 40.8276, -73.6000 40.8176))', 4326)),
('site_009', 'Upper Manhattan Plaza', 1, 1, NULL, ST_GeomFromText('POLYGON((-73.9500 40.8000, -73.9400 40.8000, -73.9400 40.8100, -73.9500 40.8100, -73.9500 40.8000))', 4326)),
('site_010', 'Harlem Business District', 1, 2, 86400, ST_GeomFromText('POLYGON((-73.9400 40.8100, -73.9300 40.8100, -73.9300 40.8200, -73.9400 40.8200, -73.9400 40.8100))', 4326)),
('site_011', 'Washington Heights Complex', 1, 1, NULL, ST_GeomFromText('POLYGON((-73.9300 40.8500, -73.9200 40.8500, -73.9200 40.8600, -73.9300 40.8600, -73.9300 40.8500))', 4326)),
('site_012', 'Inwood Shopping Center', 1, 2, 86400, ST_GeomFromText('POLYGON((-73.9200 40.8700, -73.9100 40.8700, -73.9100 40.8800, -73.9200 40.8800, -73.9200 40.8700))', 4326)),
('site_013', 'Red Hook Terminal', 2, 3, NULL, ST_GeomFromText('POLYGON((-74.0100 40.6700, -74.0000 40.6700, -74.0000 40.6800, -74.0100 40.6800, -74.0100 40.6700))', 4326)),
('site_014', 'Sunset Park Warehouse', 2, 4, 86400, ST_GeomFromText('POLYGON((-74.0000 40.6500, -73.9900 40.6500, -73.9900 40.6600, -74.0000 40.6600, -74.0000 40.6500))', 4326)),
('site_015', 'Bay Ridge Facility', 2, 3, NULL, ST_GeomFromText('POLYGON((-74.0200 40.6300, -74.0100 40.6300, -74.0100 40.6400, -74.0200 40.6400, -74.0200 40.6300))', 4326)),
('site_016', 'Coney Island Depot', 2, 4, 86400, ST_GeomFromText('POLYGON((-73.9800 40.5800, -73.9700 40.5800, -73.9700 40.5900, -73.9800 40.5900, -73.9800 40.5800))', 4326)),
('site_017', 'Brighton Beach Center', 2, 3, NULL, ST_GeomFromText('POLYGON((-73.9600 40.5700, -73.9500 40.5700, -73.9500 40.5800, -73.9600 40.5800, -73.9600 40.5700))', 4326)),
('site_018', 'Sheepshead Bay Hub', 2, 4, 86400, ST_GeomFromText('POLYGON((-73.9500 40.5900, -73.9400 40.5900, -73.9400 40.6000, -73.9500 40.6000, -73.9500 40.5900))', 4326)),
('site_019', 'Flushing Commercial Plaza', 3, 5, NULL, ST_GeomFromText('POLYGON((-73.8300 40.7600, -73.8200 40.7600, -73.8200 40.7700, -73.8300 40.7700, -73.8300 40.7600))', 4326)),
('site_020', 'Astoria Distribution Point', 3, 5, 86400, ST_GeomFromText('POLYGON((-73.9200 40.7700, -73.9100 40.7700, -73.9100 40.7800, -73.9200 40.7800, -73.9200 40.7700))', 4326)),
('site_021', 'Jackson Heights Complex', 3, 5, NULL, ST_GeomFromText('POLYGON((-73.8900 40.7500, -73.8800 40.7500, -73.8800 40.7600, -73.8900 40.7600, -73.8900 40.7500))', 4326)),
('site_022', 'Elmhurst Business Park', 3, 5, 86400, ST_GeomFromText('POLYGON((-73.8800 40.7400, -73.8700 40.7400, -73.8700 40.7500, -73.8800 40.7500, -73.8800 40.7400))', 4326)),
('site_023', 'Corona Industrial Zone', 3, 5, NULL, ST_GeomFromText('POLYGON((-73.8500 40.7500, -73.8400 40.7500, -73.8400 40.7600, -73.8500 40.7600, -73.8500 40.7500))', 4326)),
('site_024', 'Jamaica Transit Hub', 3, 5, 86400, ST_GeomFromText('POLYGON((-73.8000 40.7000, -73.7900 40.7000, -73.7900 40.7100, -73.8000 40.7100, -73.8000 40.7000))', 4326)),
('site_025', 'Richmond Valley Station', 4, 6, NULL, ST_GeomFromText('POLYGON((-74.2000 40.5500, -74.1900 40.5500, -74.1900 40.5600, -74.2000 40.5600, -74.2000 40.5500))', 4326)),
('site_026', 'Tottenville Facility', 4, 6, 86400, ST_GeomFromText('POLYGON((-74.2500 40.5200, -74.2400 40.5200, -74.2400 40.5300, -74.2500 40.5300, -74.2500 40.5200))', 4326)),
('site_027', 'Great Kills Park', 4, 6, NULL, ST_GeomFromText('POLYGON((-74.1500 40.5400, -74.1400 40.5400, -74.1400 40.5500, -74.1500 40.5500, -74.1500 40.5400))', 4326)),
('site_028', 'New Dorp Center', 4, 6, 86400, ST_GeomFromText('POLYGON((-74.1200 40.5700, -74.1100 40.5700, -74.1100 40.5800, -74.1200 40.5800, -74.1200 40.5700))', 4326)),
('site_029', 'Midland Beach Plaza', 4, 6, NULL, ST_GeomFromText('POLYGON((-74.1000 40.5600, -74.0900 40.5600, -74.0900 40.5700, -74.1000 40.5700, -74.1000 40.5600))', 4326)),
('site_030', 'South Beach Terminal', 4, 6, 86400, ST_GeomFromText('POLYGON((-74.0800 40.5800, -74.0700 40.5800, -74.0700 40.5900, -74.0800 40.5900, -74.0800 40.5800))', 4326)),
('site_031', 'Port Richmond Complex', 1, 1, NULL, ST_GeomFromText('POLYGON((-74.1300 40.6400, -74.1200 40.6400, -74.1200 40.6500, -74.1300 40.6500, -74.1300 40.6400))', 4326)),
('site_032', 'Mariners Harbor Depot', 1, 2, 86400, ST_GeomFromText('POLYGON((-74.1600 40.6300, -74.1500 40.6300, -74.1500 40.6400, -74.1600 40.6400, -74.1600 40.6300))', 4326)),
('site_033', 'West Brighton Hub', 1, 1, NULL, ST_GeomFromText('POLYGON((-74.1100 40.6200, -74.1000 40.6200, -74.1000 40.6300, -74.1100 40.6300, -74.1100 40.6200))', 4326)),
('site_034', 'Stapleton Industrial', 1, 2, 86400, ST_GeomFromText('POLYGON((-74.0800 40.6200, -74.0700 40.6200, -74.0700 40.6300, -74.0800 40.6300, -74.0800 40.6200))', 4326)),
('site_035', 'Tompkinsville Center', 1, 1, NULL, ST_GeomFromText('POLYGON((-74.0700 40.6300, -74.0600 40.6300, -74.0600 40.6400, -74.0700 40.6400, -74.0700 40.6300))', 4326)),
('site_036', 'St. George Terminal', 1, 2, 86400, ST_GeomFromText('POLYGON((-74.0800 40.6400, -74.0700 40.6400, -74.0700 40.6500, -74.0800 40.6500, -74.0800 40.6400))', 4326)),
('site_037', 'Rosebank Facility', 1, 1, NULL, ST_GeomFromText('POLYGON((-74.0600 40.6100, -74.0500 40.6100, -74.0500 40.6200, -74.0600 40.6200, -74.0600 40.6100))', 4326)),
('site_038', 'Dongan Hills Plaza', 1, 2, 86400, ST_GeomFromText('POLYGON((-74.1000 40.6000, -74.0900 40.6000, -74.0900 40.6100, -74.1000 40.6100, -74.1000 40.6000))', 4326)),
('site_039', 'Oakwood Station', 1, 1, NULL, ST_GeomFromText('POLYGON((-74.1300 40.5600, -74.1200 40.5600, -74.1200 40.5700, -74.1300 40.5700, -74.1300 40.5600))', 4326)),
('site_040', 'New Springville Complex', 1, 2, 86400, ST_GeomFromText('POLYGON((-74.1800 40.6000, -74.1700 40.6000, -74.1700 40.6100, -74.1800 40.6100, -74.1800 40.6000))', 4326)),
('site_041', 'Travis Industrial Park', 1, 1, NULL, ST_GeomFromText('POLYGON((-74.1900 40.5900, -74.1800 40.5900, -74.1800 40.6000, -74.1900 40.6000, -74.1900 40.5900))', 4326)),
('site_042', 'Bloomfield Center', 1, 2, 86400, ST_GeomFromText('POLYGON((-74.2000 40.6100, -74.1900 40.6100, -74.1900 40.6200, -74.2000 40.6200, -74.2000 40.6100))', 4326)),
('site_043', 'Castleton Corners Hub', 1, 1, NULL, ST_GeomFromText('POLYGON((-74.1200 40.6300, -74.1100 40.6300, -74.1100 40.6400, -74.1200 40.6400, -74.1200 40.6300))', 4326));

-- Clear all existing statuses
DELETE FROM statuses;

-- Statuses table is ready for use
-- Time windows are now calculated using relative anchor (midnight of current day)
-- Window start times are calculated dynamically based on the refresh_seconds and current timestamp
-- No sample status data is inserted as windows are calculated relative to "now"

