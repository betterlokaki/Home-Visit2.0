# Frontend

React frontend for Home Visit 2.0

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Download Heebo fonts:
   - Download Heebo font files (woff2 format)
   - Hebrew subset: U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F
   - Latin subset: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD
   - Place files in `public/fonts/`:
     - `heebo-hebrew.woff2`
     - `heebo-latin.woff2`

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Notes

- The backend needs to support `GET /users?username={username}` endpoint for login to work
- Fonts must be downloaded locally before use
