# Gamelink Backend API

## Setup Instructions

### Prerequisites
- Node.js 14+
- PostgreSQL 12+
- npm

### Installation

```bash
# Navigate to backend directory
cd gamelink-backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or open with your editor

# Install dependencies
npm install
```

### Environment Variables (.env)

```
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamelink
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
```

### Running the Server

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

Server will be available at `http://localhost:5000`

## Database Setup

### Create Database

```bash
# Using PostgreSQL
psql -U postgres
CREATE DATABASE gamelink;
\q
```

### Initialize Schema

```bash
psql -U postgres -d gamelink -f ../gamelink-database/schema.sql
```

## API Structure

All endpoints require authentication (JWT token) except login and register.

### Authentication Header
```
Authorization: Bearer <token>
```

## Key Features

- JWT-based authentication
- Role-based access control (Gamer/Business)
- M-Pesa payment integration (placeholder)
- Tournament management
- PVP takeon system
- Social feed with posts
- Team management

## File Structure

```
gamelink-backend/
├── routes/              # API endpoint definitions
│   ├── auth.js         # Authentication endpoints
│   ├── gamers.js       # Gamer profile endpoints
│   ├── businesses.js   # Business endpoints
│   ├── tournaments.js  # Tournament management
│   ├── activities.js   # Activity tracking
│   ├── pvp.js          # PVP takeon endpoints
│   ├── posts.js        # Social feed
│   └── payments.js     # Payment endpoints
├── middleware/          # Custom middleware
│   └── authMiddleware.js
├── config/             # Configuration files
│   ├── database.js     # Database connection
│   └── constants.js    # App constants
├── server.js           # Main server file
├── package.json        # Dependencies
└── .env.example        # Example environment variables
```

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error
- Ensure PostgreSQL is running
- Verify database credentials in .env
- Check if database exists: `psql -l`

### JWT Token Invalid
- Ensure JWT_SECRET matches in .env
- Token may have expired (check JWT_EXPIRY)
- Clear and re-login

## Development Tips

- Use Postman or similar tool to test endpoints
- Check server logs for detailed error messages
- Ensure database schema is initialized
- Use `npm run dev` for automatic reload on code changes

---

See main README.md for complete project documentation.
