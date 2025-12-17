# Mock Services

Dynamic mock services that simulate external cover status and site link services.

## Features

- **Dynamic responses**: Generates responses based on incoming requests
- **Realistic simulation**: Sometimes returns data (70% probability), sometimes returns no data (30% probability) to simulate real-world scenarios
- **Cover status values**: Randomly generates 'Full', 'Partial', or 'Empty' status
- **Time window support**: For historical data, generates time windows based on refresh seconds

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start the mock server:
```bash
pnpm start
```

By default, the server runs on port 3001. To run on a different port:
```bash
PORT=3002 pnpm start
```

## Running Multiple Instances

If you need both service1 (port 3001) and service2 (port 3002) running:

**Terminal 1:**
```bash
PORT=3001 pnpm start
```

**Terminal 2:**
```bash
PORT=3002 pnpm start
```

Alternatively, you can update `config.json` to use the same port for both services during testing.

## Endpoints

- `POST /service1/current-status` - Returns cover status and site links for requested sites
  - Request body should contain `geometries.siteNames` array
  - Response contains `sites` array with `siteName`, `status`, and `projectLink`
  - Some sites may not be included in response (simulates "no data available")

- `POST /service2/historical-status` - Returns historical cover status for a site
  - Request body should contain `geometry.wkt` and `timeframes.refreshSeconds` array
  - Response contains `history` array with `date` and `status`
  - Some time windows may not be included (simulates missing data)

- `GET /health` - Health check endpoint

## Behavior

- **Deterministic data availability**: Each site/time window has a 70% chance of having data, but this is **deterministic** - the same site will always have the same data availability across requests
- **Consistent cover status**: Cover status is deterministically assigned based on site name (or time window for historical data), so the same site will always return the same status
- **Project links**: Generated as `https://project-link.example.com/{siteName}`
- **Time windows**: Historical data uses the anchor date (2025-01-12 00:00:00) and refresh seconds to calculate windows
- **Consistency guarantee**: If a site has cover status data in a specific timeframe, it will consistently have data in subsequent requests for that same timeframe
