# Vacation Planner

A team vacation planning and coordination web application with calendar integration.

## 🚀 Quick Deploy

**Deploy instantly with one click on open source cloud infrastructure:**

[![Deploy on Open Source Cloud](https://img.shields.io/badge/Deploy%20on-Open%20Source%20Cloud-blue?style=for-the-badge&logo=cloud)](https://app.osaas.io/browse/birme-vacay-planner)

No setup required! Click the button above to deploy your own instance of Vacation Planner on Open Source Cloud - a free, open source cloud platform. Your application will be up and running in minutes with:

- ✅ Automatic database provisioning
- ✅ SSL certificate included  
- ✅ Production-ready environment
- ✅ Zero configuration needed
- ✅ Free hosting on open source infrastructure

## Features

- **User Authentication**: Role-based access (Admin/User)
- **Vacation Management**: Create, edit, and track vacation requests
- **Admin Panel**: User management and vacation approval/rejection
- **Calendar Integration**: iCal feeds for personal and team calendars
- **Real-time Updates**: Live status updates and notifications

## Tech Stack

### Backend
- Node.js with Express.js
- CouchDB for data storage
- JWT for authentication
- iCal generator for calendar feeds

### Frontend
- React 18
- React Router for navigation
- React Query for data fetching
- Tailwind CSS for styling
- Headless UI for components

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- CouchDB (local or hosted instance)

### Installation

1. Clone the repository and install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:

Copy the server environment template:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your configuration:
```env
PORT=3001
COUCHDB_URL=http://admin:password@localhost:5984
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### CouchDB Setup

You can either use a local CouchDB instance or create one using OSC (Open Service Cloud):

#### Option 1: Local CouchDB
1. Install CouchDB locally
2. Create admin user
3. Update COUCHDB_URL in `.env`

#### Option 2: OSC CouchDB Instance
```bash
# Create a CouchDB instance in OSC
/mcp osc create-database couchdb vacay-db --opts '{"database": "vacaydb", "username": "admin", "password": "your-password", "rootPassword": "root-password"}'

# Get the connection details and update your .env file
```

### Running the Application

#### Integrated Production Mode (Recommended)
Start the integrated server (frontend served through backend):
```bash
npm start
```

This builds the React frontend and serves it through the Express server on **http://localhost:3001**

#### Development Mode
Start both backend and frontend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend only
npm run server:dev

# Frontend only  
npm run client:dev
```

Development mode URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

#### Production Mode
- **Integrated App**: http://localhost:3001 (serves both frontend and API)

## Default Admin Account

The application creates a default admin account on first run:
- Email: `admin@company.com`
- Password: `admin123`

**Important**: Change the default admin password after initial setup.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Vacations
- `GET /api/vacations` - List vacations (filtered by user role)
- `POST /api/vacations` - Create vacation request
- `GET /api/vacations/:id` - Get specific vacation
- `PUT /api/vacations/:id` - Update vacation
- `DELETE /api/vacations/:id` - Delete vacation

### Calendar Feeds
- `GET /api/calendar/feed/:userId` - Personal calendar feed (iCal)
- `GET /api/calendar/team-feed` - Team calendar feed (iCal)
- `GET /api/calendar/urls` - Get calendar feed URLs

## Calendar Integration

The application provides iCal feeds that can be subscribed to in calendar applications:

1. **Personal Feed**: Shows your approved vacation requests
2. **Team Feed**: Shows all team members' approved vacation requests

To subscribe to these feeds:
1. Log into the application
2. Go to Dashboard
3. Copy the calendar feed URLs
4. Add them to your calendar application (Google Calendar, Outlook, etc.)

## User Roles

### Admin
- Manage users (create, update, delete)
- Approve/reject vacation requests
- View all team vacation requests
- Access admin panel

### User
- Create vacation requests
- Edit own vacation requests
- View personal vacation history
- Access calendar feeds

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| COUCHDB_URL | CouchDB connection URL | Required |
| JWT_SECRET | JWT signing secret | Required |
| NODE_ENV | Environment | development |

## Database Schema

### Users Collection
```json
{
  "_id": "user_uuid",
  "id": "uuid",
  "email": "user@company.com",
  "name": "User Name",
  "password": "hashed_password",
  "role": "admin|user",
  "active": true,
  "createdAt": "ISO_DATE"
}
```

### Vacations Collection
```json
{
  "_id": "vacation_uuid",
  "id": "uuid",
  "title": "Summer Vacation",
  "description": "Optional description",
  "startDate": "ISO_DATE",
  "endDate": "ISO_DATE",
  "type": "vacation|sick|personal|other",
  "status": "pending|approved|rejected",
  "userId": "user_id",
  "userName": "User Name",
  "userEmail": "user@company.com",
  "createdAt": "ISO_DATE"
}
```

## Production Deployment

### Local Production Deployment

1. Set production environment variables in `server/.env`:
```env
PORT=3001
COUCHDB_URL=your_production_couchdb_url
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
```

2. Start the production server (automatically builds frontend):
```bash
npm start
```

The integrated application will be available at the configured PORT (default: 3001)

### Container Deployment

The application is fully containerized and supports configurable PORT binding through environment variables.

#### Using Docker

1. **Build the Docker image:**
```bash
docker build -t vacay-planner .
```

2. **Run with custom port (e.g., port 8080):**
```bash
docker run -d \
  --name vacay-planner \
  -p 8080:8080 \
  -e PORT=8080 \
  -e COUCHDB_URL="your_couchdb_url" \
  -e JWT_SECRET="your_jwt_secret" \
  -e NODE_ENV=production \
  vacay-planner
```

3. **Using environment file:**
```bash
# Copy and configure environment
cp .env.container.example .env

# Run container with env file
docker run -d \
  --name vacay-planner \
  -p 8080:8080 \
  --env-file .env \
  vacay-planner
```

#### Using Docker Compose

1. **Configure environment:**
```bash
cp .env.container.example .env
# Edit .env with your configuration
```

2. **Deploy with docker-compose:**
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

#### Container Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Port to bind the application | 8080 | No |
| `COUCHDB_URL` | CouchDB connection URL | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `NODE_ENV` | Node environment | production | No |

#### Container Features

- **Health Checks**: Built-in health monitoring on `/health` endpoint
- **Non-root User**: Runs as unprivileged user for security
- **Multi-stage Build**: Optimized image size with production dependencies only
- **Port Flexibility**: Configurable port binding via `PORT` environment variable

#### Example Deployments

**Development/Testing (port 3000):**
```bash
docker run -p 3000:3000 -e PORT=3000 -e COUCHDB_URL="..." -e JWT_SECRET="dev-secret" vacay-planner
```

**Production (port 80):**
```bash
docker run -p 80:80 -e PORT=80 -e COUCHDB_URL="..." -e JWT_SECRET="secure-secret" vacay-planner
```

**Behind reverse proxy (port 8080):**
```bash
docker run -p 8080:8080 -e PORT=8080 -e COUCHDB_URL="..." -e JWT_SECRET="..." vacay-planner
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License