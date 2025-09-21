const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

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
  { id: '1', type: 'Plastic bottles', location: 'Everest Base Camp Trail', date: '2025-09-18', verified: true, lat: 28.0026, lng: 86.8528 },
  { id: '2', type: 'Food packaging', location: 'Annapurna Circuit', date: '2025-09-17', verified: false, lat: 28.2096, lng: 83.9856 },
  { id: '3', type: 'Batteries', location: 'Manaslu Trek', date: '2025-09-16', verified: true, lat: 28.5495, lng: 84.5610 }
];

const mockEvents = [
  { id: '1', title: 'Base Camp Cleanup Drive', date: 'Sept 25', participants: 45, location: 'Everest Base Camp' },
  { id: '2', title: 'Annapurna Trail Restoration', date: 'Oct 2', participants: 32, location: 'Annapurna Circuit' }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    success: true,
    data: { user: mockUser, token: 'mock-jwt-token' },
    message: 'Login successful'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  res.status(201).json({
    success: true,
    data: { user: { ...mockUser, email, name: name || 'New User' }, token: 'mock-jwt-token' },
    message: 'User registered successfully'
  });
});

// User routes
app.get('/api/users/profile', (req, res) => {
  res.json({ success: true, data: mockUser });
});

app.get('/api/users/leaderboard', (req, res) => {
  const leaderboard = [
    { name: 'Mountain Mike', points: 2340, rank: 1 },
    { name: 'Trail Explorer', points: 1890, rank: 2 },
    { name: 'You', points: mockUser.points, rank: 3 },
    { name: 'Peak Seeker', points: 1150, rank: 4 }
  ];
  res.json({ success: true, data: leaderboard });
});

// Waste routes
app.get('/api/waste', (req, res) => {
  res.json({ success: true, data: mockWasteEntries });
});

app.post('/api/waste', (req, res) => {
  const { type, location, lat, lng, photo } = req.body;
  const newEntry = {
    id: String(mockWasteEntries.length + 1),
    type,
    location,
    lat: lat ? parseFloat(lat) : null,
    lng: lng ? parseFloat(lng) : null,
    photo: photo || null,
    date: new Date().toISOString().split('T')[0],
    verified: false
  };
  mockWasteEntries.push(newEntry);
  res.status(201).json({ success: true, data: newEntry, message: 'Waste entry created successfully' });
});

// Hotspot routes
const mockHotspots = [
  { id: '1', title: 'Heavy plastic waste area', lat: 28.0026, lng: 86.8528, priority: 'HIGH' },
  { id: '2', title: 'Discarded camping gear', lat: 28.2096, lng: 83.9856, priority: 'MEDIUM' }
];

app.get('/api/hotspots', (req, res) => {
  res.json({ success: true, data: mockHotspots });
});

app.post('/api/hotspots', (req, res) => {
  const { title, description, lat, lng, priority } = req.body;
  const newHotspot = {
    id: String(mockHotspots.length + 1),
    title,
    description,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    priority: priority || 'MEDIUM'
  };
  mockHotspots.push(newHotspot);
  res.status(201).json({ success: true, data: newHotspot, message: 'Hotspot reported successfully' });
});

// Event routes
app.get('/api/events', (req, res) => {
  res.json({ success: true, data: mockEvents });
});

app.post('/api/events/:id/join', (req, res) => {
  res.status(201).json({ success: true, message: 'Successfully joined event' });
});

app.listen(PORT, () => {
  console.log(`🌟 Sarsafai API running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});