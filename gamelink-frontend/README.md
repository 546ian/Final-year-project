# Gamelink Frontend

## Setup Instructions

### Prerequisites
- Node.js 14+
- npm

### Installation

```bash
# Navigate to frontend directory
cd gamelink-frontend

# Copy environment file
cp .env.example .env

# Edit .env if needed (default should work for local development)
nano .env  # or open with your editor

# Install dependencies
npm install
```

### Environment Variables (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
```

Change this if your backend is running on a different URL.

### Running the Application

```bash
# Development server (with hot reload)
npm start

# Build for production
npm build

# Run tests
npm test
```

Frontend will be available at `http://localhost:3000`

## Project Structure

```
gamelink-frontend/
├── public/
│   └── index.html              # Main HTML file
├── src/
│   ├── pages/                  # 15 page components
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── GamerRegisterPage.js
│   │   ├── BusinessRegisterPage.js
│   │   ├── BusinessHomePage.js
│   │   ├── GamerHomePage.js
│   │   ├── HostTournamentPage.js
│   │   ├── TeamRosterPage.js
│   │   ├── GamerProfilePage.js
│   │   ├── GamerActivitiesPage.js
│   │   ├── BusinessLogsPage.js
│   │   └── styles/            # CSS for pages
│   ├── components/            # Reusable components
│   ├── utils/                 # Utility functions
│   │   ├── api.js            # API calls
│   │   └── AuthContext.js     # Auth state management
│   ├── App.js                # Main app component with routing
│   ├── App.css               # Global styles
│   └── index.js              # Entry point
├── package.json
└── .env.example
```

## Features

### Pages (15 total)
1. Login - User authentication
2. Register - Account type selection
3. Gamer Register - Gamer sign-up
4. Business Register - Business sign-up
5. Business Home - Business dashboard
6. Gamer Home - Gamer dashboard
7. Host Tournament - Tournament creation
8. Team Roster - Team management
9. Gamer Profile - Profile editing
10. Activities - Activity posting
11. Business Logs - Logs and announcements
12-15. Various modal popups and sub-pages

### Key Components
- **Authentication**: JWT token management, protected routes
- **Navigation**: React Router for page navigation
- **API Integration**: Axios for backend communication
- **State Management**: Context API for global auth state
- **Charts**: Recharts for progress visualization
- **Responsive Design**: CSS Grid and Flexbox

## Authentication Flow

1. User fills login/register form
2. Request sent to backend API
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. Token added to all subsequent API requests
6. Protected routes check for token presence

## API Integration

All API calls are centralized in `src/utils/api.js`:

```javascript
// Example usage in components
const response = await gamerAPI.getProfile(userId);
const tournament = await tournamentAPI.getDetails(id);
```

## Styling

- Global styles in `App.css`
- Page-specific styles in `pages/styles/`
- Color scheme:
  - Background: Dark blue (#0a0e27)
  - Accent: Orange (#ffa500)
  - Secondary: Red (#ff6b6b)

## Common Issues

### Blank Page After Login
- Check browser console for errors (F12)
- Verify backend is running on localhost:5000
- Check .env REACT_APP_API_URL

### API Calls Failing
- Ensure backend is running: `npm run dev` in backend directory
- Check network tab in browser developer tools
- Verify API endpoint URLs in `src/utils/api.js`

### Styling Issues
- Clear browser cache (Ctrl+F5)
- Rebuild: `rm -rf node_modules && npm install`

### Blank Login/Empty Forms
- Check if page component is properly imported in App.js
- Verify state is properly initialized

## Development Tips

- Use React DevTools browser extension for debugging
- Check console for errors: F12 → Console tab
- Use Network tab to debug API calls
- Keep API calls in utils/api.js for consistency
- Test authentication flow thoroughly

## Deployment

For production deployment:

1. Build the project:
   ```bash
   npm run build
   ```

2. Update .env with production API URL

3. Deploy `build/` folder to static hosting (Vercel, Netlify, AWS S3, etc.)

## Available Scripts

```bash
npm start       # Start development server
npm build       # Build for production
npm test        # Run tests
npm eject       # Eject from Create React App (irreversible)
```

---

See main README.md for complete project documentation.
