# Social Time

Social Time is a social media application in which users can form groups and organize events.

## Development Environment

### Prerequisites

- Node.js LTS
- Code editor or IDE of your choice

### Database

- Local
  - pgAdmin 4
  - PostGIS
  - Database with PostGIS extension
- Online
  - PostgreSQL provider of your choice (e.g. Neon)
  - Database with PostGIS extension

### Services

- Discord OAuth
- Google OAuth
- Google Maps API
- Pusher Channels
- UploadThing

### Environment Variables

- Add a '.env' file in the project root directory.
- '.env.example' file shows what variables are needed.
- Fill environment variables with API keys from Database and Services.

### Install Dependencies

`npm install`

### Run

`npm run dev`
