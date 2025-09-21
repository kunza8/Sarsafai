# Sarsafai - Himalayan Cleanup App

A full-stack web application for tracking waste cleanup efforts in the Himalayas, featuring interactive maps, photo uploads, and community engagement.

## Project Structure

```
Sarsafai/
├── frontend/               # React Frontend Application
│   ├── src/
│   │   ├── App.tsx        # Main React component with all features
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Tailwind CSS styles
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   └── index.html         # HTML template
│
└── backend/               # Node.js Backend API
    ├── src/               # TypeScript source code
    ├── prisma/            # Database schema and migrations
    ├── server.js          # Express API server (JavaScript)
    ├── simple-server.ts   # Express API server (TypeScript)
    └── package.json       # Backend dependencies
```

## Features

### Frontend
- **Interactive UI**: All buttons are functional with real-time feedback
- **Photo Upload**: Camera capture and file upload for waste documentation
- **Real-time Map**: Interactive map showing pollution hotspots
- **Form Modals**: Waste entry, hotspot reporting, and event registration
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend
- **RESTful API**: Complete API endpoints for all features
- **Database Integration**: PostgreSQL with Prisma ORM
- **Mock Data**: Development-ready mock data for testing
- **CORS Support**: Configured for frontend-backend communication

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for production)

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: http://localhost:5175/

### Backend Development
```bash
cd backend
npm install
node server.js
```
Backend API will be available at: http://localhost:3001/api/

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users/profile` - User profile
- `GET /api/users/leaderboard` - Leaderboard
- `GET /api/waste` - Get waste entries
- `POST /api/waste` - Create waste entry
- `GET /api/hotspots` - Get hotspots
- `POST /api/hotspots` - Report hotspot
- `GET /api/events` - Get events
- `POST /api/events/:id/join` - Join event

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS v4 for styling
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript support
- Prisma ORM
- PostgreSQL database
- CORS and security middleware

## Development Notes

- Both frontend and backend run independently
- Frontend connects to backend API on port 3001
- Hot reload enabled for both services
- All interactive features are fully functional
- Photo upload supports both camera capture and file selection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.