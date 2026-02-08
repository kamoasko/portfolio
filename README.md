# KamranDev Portfolio - Full Stack Admin Panel

A complete full-stack portfolio system with:

- **Frontend**: Vanilla JavaScript portfolio that fetches dynamic content from backend API
- **Backend**: Node.js + Express REST API with MongoDB
- **Admin Dashboard**: Vue 3 + TypeScript SPA for managing portfolio content

## Architecture Overview

```
┌──────────────────────┐
│   Public Portfolio   │  ← Vanilla JS, fetches from API
│   (index.html)       │
└──────────────────────┘
           ↓
┌──────────────────────┐     ┌──────────────────────┐
│   Backend API/       │←────→│     MongoDB          │
│   Express Server     │     │                      │
│   (Port 3000)        │     └──────────────────────┘
└──────────────────────┘
           ↑
┌──────────────────────┐
│   Admin Dashboard    │  ← Vue 3 + TypeScript SPA
│   (Port 5173)        │    (Vite dev server)
└──────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas URI)
- Git (optional)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
cp .env.example .env
# Edit .env and add:
# - MongoDB URI
# - JWT secrets
# - Any other required settings

# Run development server
npm run dev
# Server will be available at http://localhost:3000

# Build for production
npm run build
npm start
```

### 2. Frontend Integration

The portfolio frontend (`/index.html`) is already configured to fetch data from the backend API:

1. Make sure the backend is running on `http://localhost:3000`
2. Open `index.html` in your browser (can be served via `python -m http.server`)
3. The page will automatically:
   - Fetch projects from `/api/projects`
   - Load hero content from `/api/content/hero`
   - Load about content from `/api/content/about`
   - Submit contact forms to `/api/messages`
   - Log telemetry to `/api/telemetry/events`

### 3. Admin Dashboard Setup

```bash
cd admin-dashboard

# Install dependencies
npm install

# Create .env.local file (or use the default that's already there)
# Make sure VITE_API_BASE_URL points to your backend

# Run development server
npm run dev
# Dashboard will be available at http://localhost:5173

# Build for production
npm run build
# Output will be in ./dist/
```

## API Endpoints

### Authentication (Public)

- `POST /api/auth/register` - Create admin account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token

### Projects (Mixed)

- `GET /api/projects` - List published projects (public)
- `GET /api/projects/:id` - Get project details (public)
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)
- `PATCH /api/projects/:id/publish` - Toggle publish (admin only)
- `PATCH /api/projects/reorder` - Reorder projects (admin only)

### Content (Mixed)

- `GET /api/content/:type` - Get hero/about/skills content (public)
- `PUT /api/content/:type` - Update content (admin only)

### Messages (Mixed)

- `POST /api/messages` - Submit contact form (public)
- `GET /api/messages` - List messages (admin only)
- `PATCH /api/messages/:id/read` - Mark as read (admin only)
- `PATCH /api/messages/:id/reply` - Send reply (admin only)
- `DELETE /api/messages/:id` - Delete message (admin only)

### Telemetry (Mixed)

- `POST /api/telemetry/events` - Log event (public)
- `GET /api/telemetry/analytics` - Get analytics (admin only)
- `GET /api/telemetry/summary` - Get summary stats (admin only)

## Default Admin Credentials

After setup, you can register the first admin user. The first user created becomes an admin.

```bash
# Via Admin Dashboard:
1. Go to http://localhost:5173/register
2. Create account with email/password
3. This becomes the admin account
```

Or you can pre-populate with defaults from `.env`:

```
ADMIN_EMAIL=admin@kamrandev.com
ADMIN_PASSWORD=initial_password
```

## Database Schema

### Users Collection

```javascript
{
  email: String (unique),
  username: String (unique),
  passwordHash: String (bcrypted),
  role: "admin" | "viewer",
  isActive: Boolean,
  createdAt: Date,
  lastLogin: Date
}
```

### Projects Collection

```javascript
{
  title: String,
  description: String,
  technologies: [String],
  previewColor: String,
  order: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (ref: User)
}
```

### Messages Collection

```javascript
{
  name: String,
  email: String,
  message: String,
  isRead: Boolean,
  isArchived: Boolean,
  reply: String,
  repliedBy: ObjectId (ref: User),
  submittedAt: Date
}
```

### Content Collection

```javascript
{
  type: "hero" | "about" | "skills",
  heroTitle: String,
  heroTagline: String,
  aboutDescription: String,
  skills: [{ category: String, items: [String] }],
  socialLinks: [{ platform: String, url: String }],
  updatedAt: Date,
  lastModifiedBy: ObjectId (ref: User)
}
```

## Project Structure

```
portfolio/
├── frontend/                   # Public portfolio
│   ├── index.html             # Main page
│   └── assets/
│       ├── css/styles.css     # Custom animations
│       └── js/
│           ├── api-client.js  # NEW: Backend API communication
│           └── main.js        # Updated: Now fetches from API
│
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── app.ts            # Express setup
│   │   ├── server.ts         # Entry point
│   │   ├── config/           # Configuration
│   │   ├── models/           # MongoDB schemas
│   │   ├── controllers/      # Route handlers
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Custom middleware
│   │   ├── services/         # Business logic
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
└── admin-dashboard/            # Vue 3 SPA
    ├── src/
    │   ├── main.ts           # Entry point
    │   ├── App.vue           # Root component
    │   ├── components/       # Reusable components
    │   ├── views/            # Page components
    │   ├── stores/           # Pinia stores (auth, projects, ui)
    │   ├── services/         # API service
    │   ├── router/           # Route definitions
    │   └── types/            # TypeScript interfaces
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    ├── .env.local
    └── .env.example
```

## Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/portfolio
MONGODB_DATABASE=portfolio
JWT_SECRET=your_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
ADMIN_EMAIL=admin@kamrandev.com
ADMIN_PASSWORD=initial_password
TELEMETRY_ENABLED=true
```

### Admin Dashboard (.env.local)

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=KamranDev Admin
VITE_APP_VERSION=1.0.0
```

## Testing the Complete System

### 1. Backend API Testing

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start Backend
cd backend
npm install
npm run dev

# The API will be at http://localhost:3000
# Try: http://localhost:3000/api/health
```

### 2. Admin Dashboard Testing

```bash
# Terminal 3: Start Admin Dashboard
cd admin-dashboard
npm install
npm run dev

# Dashboard at http://localhost:5173
# 1. Go to /register to create admin account
# 2. Login with your credentials
# 3. Create a test project
# 4. The project should appear on the public portfolio
```

### 3. Frontend Portfolio Testing

```bash
# Terminal 4: Serve the portfolio
cd portfolio
# Use any static server:
python -m http.server 8000
# Or: npx http-server

# Visit http://localhost:8000
# You should see your projects from the backend
# Contact form will post to the API
# Page analytics will log to backend
```

## Workflow: Updating Portfolio Content

### Add/Edit Project

1. Admin logs into dashboard (http://localhost:5173)
2. Goes to Projects section
3. Creates or edits a project
4. Toggles "Publish" to make it visible on public site
5. Changes appear immediately on public portfolio

### Update Hero/About Section

1. Admin goes to Content section in dashboard
2. Edits Hero, About, or Skills content
3. Saves changes
4. Changes appear immediately on public portfolio

### View Contact Messages

1. Admin goes to Messages section in dashboard
2. Views list of contact messages
3. Mark as read or reply
4. Admin can see analytics and respond to visitors

### View Analytics

1. Admin goes to Analytics section
2. Sees page views, project popularity, event types
3. Can export data for analysis

## Next Steps & Future Enhancements

### Immediate:

1. **Complete Admin Dashboard Vue Components**
   - AuthView.vue - Login/Register page
   - DashboardView.vue - Overview with stats
   - ProjectsView.vue - Full project CRUD interface
   - ContentView.vue - Hero/About/Skills editor
   - MessagesView.vue - Contact inbox with replies
   - AnalyticsView.vue - Charts and analytics

2. **Testing**
   - Unit tests for backend services
   - Integration tests for API endpoints
   - E2E tests for complete workflows

3. **Deployment**
   - Backend: Deploy to Heroku, Render, or Railway
   - Admin Dashboard: Deploy to Vercel, Netlify, or GitHub Pages
   - Frontend: Keep on current hosting or upgrade

### Future Enhancements:

- Image upload for projects and content
- Email notifications for new messages
- Markdown support for project descriptions
- Dark mode for admin dashboard
- Multi-language support
- SEO optimization
- Performance monitoring
- Database backups
- Two-factor authentication
- Blog/Case studies section
- Project filtering and search
- Comment system on projects

## Troubleshooting

### Backend won't connect to MongoDB

```bash
# Check MongoDB is running
mongod

# Verify connection string in .env
# Local: mongodb://localhost:27017/portfolio
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/database
```

### Admin Dashboard can't connect to backend

```bash
# Make sure backend is running on port 3000
npm run dev  # in backend folder

# Check VITE_API_BASE_URL in .env.local
# For local dev: http://localhost:3000/api
```

### Portfolio doesn't show projects from API

```bash
# Make sure backend is running
# Check browser console for errors
# Verify projects are published in admin dashboard
# API endpoint: GET http://localhost:3000/api/projects?published=true
```

## Support & Questions

For issues or questions, check:

- Backend logs in terminal
- Browser console for frontend errors
- MongoDB for data issues
- API health: http://localhost:3000/api/health

For detailed API requests, use:

- Postman or REST Client
- Backend logs show all requests
- Admin dashboard network tab

---

**Happy Building!** 🚀
