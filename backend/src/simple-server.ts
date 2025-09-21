import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Trail Guardian',
  rank: 'Trail Guardian',
  points: 1250,
  wasteCollected: 15.2,
  hotspotsReported: 8,
  cleanupEvents: 3
};

const mockWasteEntries = [
  { id: '1', type: 'Plastic bottles', location: 'Everest Base Camp Trail', date: '2025-09-18', verified: true },
  { id: '2', type: 'Food packaging', location: 'Annapurna Circuit', date: '2025-09-17', verified: false },
  { id: '3', type: 'Batteries', location: 'Manaslu Trek', date: '2025-09-16', verified: true }
];

const mockEvents = [
  { id: '1', title: 'Base Camp Cleanup Drive', date: 'Sept 25', participants: 45, location: 'Everest Base Camp' },
  { id: '2', title: 'Annapurna Trail Restoration', date: 'Oct 2', participants: 32, location: 'Annapurna Circuit' }
];

const mockHotspots = [
  { id: '1', title: 'Heavy plastic waste area', latitude: 28.0026, longitude: 86.8528, priority: 'HIGH' },
  { id: '2', title: 'Discarded camping gear', latitude: 28.2096, longitude: 83.9856, priority: 'MEDIUM' }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    res.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token-123'
      },
      message: 'Login successful'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  if (email && password) {
    res.status(201).json({
      success: true,
      data: {
        user: { ...mockUser, email, name: name || 'New User' },
        token: 'mock-jwt-token-123'
      },
      message: 'User registered successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

// User routes
app.get('/api/users/profile', (req, res) => {
  res.json({
    success: true,
    data: mockUser
  });
});

app.get('/api/users/leaderboard', (req, res) => {
  const leaderboard = [
    { name: 'Mountain Mike', points: 2340, rank: 1 },
    { name: 'Trail Explorer', points: 1890, rank: 2 },
    { name: 'You', points: mockUser.points, rank: 3 },
    { name: 'Peak Seeker', points: 1150, rank: 4 }
  ];

  res.json({
    success: true,
    data: leaderboard
  });
});

// Waste routes
app.get('/api/waste', (req, res) => {
  res.json({
    success: true,
    data: mockWasteEntries
  });
});

app.post('/api/waste', (req, res) => {
  const { type, location, latitude, longitude } = req.body;

  const newEntry = {
    id: String(mockWasteEntries.length + 1),
    type,
    location,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    date: new Date().toISOString().split('T')[0],
    verified: false
  };

  mockWasteEntries.push(newEntry);

  res.status(201).json({
    success: true,
    data: newEntry,
    message: 'Waste entry created successfully'
  });
});

// Hotspot routes
app.get('/api/hotspots', (req, res) => {
  res.json({
    success: true,
    data: mockHotspots
  });
});

app.post('/api/hotspots', (req, res) => {
  const { title, description, latitude, longitude, priority } = req.body;

  const newHotspot = {
    id: String(mockHotspots.length + 1),
    title,
    description,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    priority: priority || 'MEDIUM'
  };

  mockHotspots.push(newHotspot);

  res.status(201).json({
    success: true,
    data: newHotspot,
    message: 'Hotspot reported successfully'
  });
});

// Event routes
app.get('/api/events', (req, res) => {
  res.json({
    success: true,
    data: mockEvents
  });
});

app.post('/api/events/:id/join', (req, res) => {
  const { id } = req.params;
  const event = mockEvents.find(e => e.id === id);

  if (event) {
    res.status(201).json({
      success: true,
      message: 'Successfully joined event'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🌟 Sarsafai API running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Frontend should connect to: http://localhost:${PORT}/api`);
});