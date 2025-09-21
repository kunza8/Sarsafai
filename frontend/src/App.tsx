import { useState, useEffect } from 'react';
import { MapPin, Camera, Award, Users, Trash2, Mountain, Plus, Calendar, Navigation, Upload, X, Locate, Edit2, Check } from 'lucide-react';
import GoogleMap from './components/GoogleMap';

function App() {
  const [currentTab, setCurrentTab] = useState('map');
  const [showWasteForm, setShowWasteForm] = useState(false);
  const [showHotspotForm, setShowHotspotForm] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState<number[]>([]);
  const [userStats, setUserStats] = useState({
    name: 'Enter Your Name',
    wasteCollected: 0,
    hotspotsReported: 0,
    cleanupEvents: 0,
    rank: 'Beginner',
    points: 0
  });

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const [wasteEntries, setWasteEntries] = useState([
    { id: 1, type: 'Plastic bottles', location: 'Everest Base Camp Trail', date: '2025-09-18', verified: true, photo: null, lat: 28.0026, lng: 86.8528 },
    { id: 2, type: 'Food packaging', location: 'Annapurna Circuit', date: '2025-09-17', verified: false, photo: null, lat: 28.2096, lng: 83.9856 },
    { id: 3, type: 'Batteries', location: 'Manaslu Trek', date: '2025-09-16', verified: true, photo: null, lat: 28.5495, lng: 84.5610 }
  ]);

  const [hotspots, setHotspots] = useState([
    { id: 1, title: 'Heavy Plastic Accumulation', location: 'Everest Base Camp Trail', priority: 'HIGH', lat: 28.0026, lng: 86.8528, reports: 12 },
    { id: 2, title: 'Food Packaging Waste', location: 'Annapurna Circuit', priority: 'MEDIUM', lat: 28.2096, lng: 83.9856, reports: 8 },
    { id: 3, title: 'Abandoned Camping Gear', location: 'Manaslu Trek', priority: 'HIGH', lat: 28.5495, lng: 84.5610, reports: 15 },
    { id: 4, title: 'Battery Disposal Area', location: 'Langtang Valley', priority: 'CRITICAL', lat: 28.2123, lng: 85.5492, reports: 22 }
  ]);

  const upcomingEvents = [
    { id: 1, title: 'Base Camp Cleanup Drive', date: 'Sept 25', participants: 45, location: 'Everest Base Camp' },
    { id: 2, title: 'Annapurna Trail Restoration', date: 'Oct 2', participants: 32, location: 'Annapurna Circuit' }
  ];

  const getAchievements = () => [
    {
      name: 'First Cleanup',
      icon: '🏆',
      unlocked: userStats.wasteCollected >= 1,
      description: 'Log your first waste collection',
      requirement: 'Collect 1 waste item'
    },
    {
      name: 'Waste Warrior',
      icon: '♻️',
      unlocked: userStats.wasteCollected >= 5,
      description: 'Become a dedicated waste collector',
      requirement: 'Collect 5 waste items'
    },
    {
      name: 'Community Builder',
      icon: '👥',
      unlocked: userStats.cleanupEvents >= 2,
      description: 'Join community cleanup events',
      requirement: 'Join 2 cleanup events'
    },
    {
      name: 'Mountain Guardian',
      icon: '🏔️',
      unlocked: userStats.wasteCollected >= 10 && userStats.hotspotsReported >= 3,
      description: 'Protect the mountains actively',
      requirement: 'Collect 10 items & report 3 hotspots'
    },
    {
      name: 'Hotspot Hunter',
      icon: '🎯',
      unlocked: userStats.hotspotsReported >= 5,
      description: 'Report multiple pollution hotspots',
      requirement: 'Report 5 hotspots'
    },
    {
      name: 'Points Master',
      icon: '⭐',
      unlocked: userStats.points >= 500,
      description: 'Accumulate significant points',
      requirement: 'Earn 500 points'
    }
  ];

  const getRank = (points: number) => {
    if (points >= 1000) return 'Mountain Guardian';
    if (points >= 500) return 'Trail Protector';
    if (points >= 200) return 'Eco Warrior';
    if (points >= 100) return 'Nature Helper';
    if (points >= 50) return 'Green Rookie';
    return 'Beginner';
  };

  const checkNewAchievements = (oldStats: any, newStats: any) => {
    const oldAchievements = [
      {
        name: 'First Cleanup',
        unlocked: oldStats.wasteCollected >= 1,
      },
      {
        name: 'Waste Warrior',
        unlocked: oldStats.wasteCollected >= 5,
      },
      {
        name: 'Community Builder',
        unlocked: oldStats.cleanupEvents >= 2,
      },
      {
        name: 'Mountain Guardian',
        unlocked: oldStats.wasteCollected >= 10 && oldStats.hotspotsReported >= 3,
      },
      {
        name: 'Hotspot Hunter',
        unlocked: oldStats.hotspotsReported >= 5,
      },
      {
        name: 'Points Master',
        unlocked: oldStats.points >= 500,
      }
    ];

    const newAchievements = [
      {
        name: 'First Cleanup',
        unlocked: newStats.wasteCollected >= 1,
      },
      {
        name: 'Waste Warrior',
        unlocked: newStats.wasteCollected >= 5,
      },
      {
        name: 'Community Builder',
        unlocked: newStats.cleanupEvents >= 2,
      },
      {
        name: 'Mountain Guardian',
        unlocked: newStats.wasteCollected >= 10 && newStats.hotspotsReported >= 3,
      },
      {
        name: 'Hotspot Hunter',
        unlocked: newStats.hotspotsReported >= 5,
      },
      {
        name: 'Points Master',
        unlocked: newStats.points >= 500,
      }
    ];

    const newlyUnlocked = newAchievements.filter(newAch =>
      newAch.unlocked && !oldAchievements.find(old => old.name === newAch.name)?.unlocked
    );

    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked.map(a => a.name));
      setTimeout(() => setNewAchievements([]), 5000);
    }
  };

  const handleAddWasteEntry = (formData: any) => {
    const newEntry = {
      id: wasteEntries.length + 1,
      type: formData.type,
      location: formData.location,
      date: new Date().toISOString().split('T')[0],
      verified: false,
      photo: formData.photo || null,
      lat: formData.lat || (currentLocation?.lat ?? 28.0 + Math.random() * 0.5),
      lng: formData.lng || (currentLocation?.lng ?? 84.0 + Math.random() * 3)
    };
    setWasteEntries([newEntry, ...wasteEntries]);
    const oldStats = userStats;
    const newStats = {
      ...oldStats,
      wasteCollected: oldStats.wasteCollected + 1,
      points: oldStats.points + 25
    };
    newStats.rank = getRank(newStats.points);

    checkNewAchievements(oldStats, newStats);
    setUserStats(newStats);
    setShowWasteForm(false);
  };

  const handleAddHotspot = (formData: any) => {
    const newHotspot = {
      id: hotspots.length + 1,
      title: formData.title,
      location: formData.location,
      priority: formData.priority,
      lat: formData.lat || (currentLocation?.lat ?? 28.0 + Math.random() * 0.5),
      lng: formData.lng || (currentLocation?.lng ?? 84.0 + Math.random() * 3),
      reports: 1
    };
    setHotspots([newHotspot, ...hotspots]);
    const oldStats = userStats;
    const newStats = {
      ...oldStats,
      hotspotsReported: oldStats.hotspotsReported + 1,
      points: oldStats.points + 25
    };
    newStats.rank = getRank(newStats.points);

    checkNewAchievements(oldStats, newStats);
    setUserStats(newStats);
    setShowHotspotForm(false);
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  };


  const handleJoinEvent = (eventId: number) => {
    if (!joinedEvents.includes(eventId)) {
      setJoinedEvents([...joinedEvents, eventId]);
      const oldStats = userStats;
      const newStats = {
        ...oldStats,
        cleanupEvents: oldStats.cleanupEvents + 1,
        points: oldStats.points + 50
      };
      newStats.rank = getRank(newStats.points);

      checkNewAchievements(oldStats, newStats);
      setUserStats(newStats);
    }
  };

  const TabContent = () => {
    switch(currentTab) {
      case 'map':
        return (
          <div className="p-4">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-800">Pollution Hotspots</h2>
                <button
                  onClick={() => setShowHotspotForm(true)}
                  className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-red-600 transition-colors"
                >
                  <Plus size={14} />
                  Report
                </button>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Himalayan Region Map</span>
                  <button
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      locationLoading
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <Locate size={12} className={locationLoading ? 'animate-spin' : ''} />
                    {locationLoading ? 'Locating...' : 'My Location'}
                  </button>
                </div>
                <div className="h-64 rounded-lg overflow-hidden border">
                  {window.google ? (
                    <GoogleMap
                      center={currentLocation || { lat: 28.2, lng: 84.5 }}
                      zoom={8}
                      markers={[
                        ...(currentLocation ? [{
                          id: 'user-location',
                          position: currentLocation,
                          title: `You are here`,
                          type: 'user' as const
                        }] : []),
                        ...wasteEntries.map(entry => ({
                          id: `waste-${entry.id}`,
                          position: { lat: entry.lat, lng: entry.lng },
                          title: `${entry.type} - ${entry.location}`,
                          type: 'waste' as const
                        })),
                        ...hotspots.map(hotspot => ({
                          id: `hotspot-${hotspot.id}`,
                          position: { lat: hotspot.lat, lng: hotspot.lng },
                          title: hotspot.title,
                          type: 'hotspot' as const,
                          priority: hotspot.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
                        }))
                      ]}
                    />
                  ) : (
                    <div className="h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
                {currentLocation && (
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    📍 Your location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold text-red-700">Critical/High Priority</span>
                  </div>
                  <p className="text-sm text-red-600">
                    {hotspots.filter(h => h.priority === 'CRITICAL' || h.priority === 'HIGH').length} locations need attention
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-semibold text-yellow-700">Medium Priority</span>
                  </div>
                  <p className="text-sm text-yellow-600">
                    {hotspots.filter(h => h.priority === 'MEDIUM').length} locations reported this week
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Navigation size={18} className="text-blue-500" />
                Popular Trails
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Everest Base Camp Trek', location: 'Khumbu Region', elevation: '5,364m', duration: '14-16 days', reports: hotspots.filter(h => h.location.includes('Everest')).length || 15 },
                  { name: 'Annapurna Circuit Trek', location: 'Annapurna Region', elevation: '5,416m', duration: '15-20 days', reports: hotspots.filter(h => h.location.includes('Annapurna')).length || 8 },
                  { name: 'Manaslu Circuit Trek', location: 'Manaslu Region', elevation: '5,106m', duration: '14-18 days', reports: hotspots.filter(h => h.location.includes('Manaslu')).length || 7 },
                  { name: 'Langtang Valley Trek', location: 'Langtang Region', elevation: '4,984m', duration: '7-12 days', reports: hotspots.filter(h => h.location.includes('Langtang')).length || 5 },
                  { name: 'Upper Mustang Trek', location: 'Mustang Region', elevation: '4,000m', duration: '12-14 days', reports: hotspots.filter(h => h.location.includes('Mustang')).length || 3 },
                  { name: 'Gokyo Lakes Trek', location: 'Khumbu Region', elevation: '5,357m', duration: '12-14 days', reports: hotspots.filter(h => h.location.includes('Gokyo')).length || 4 }
                ].map((trail, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{trail.name}</h4>
                        <p className="text-xs text-gray-600">{trail.location}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{trail.reports} reports</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>⛰️ {trail.elevation}</span>
                      <span>📅 {trail.duration}</span>
                      <button
                        onClick={() => {
                          const trailHotspots = hotspots.filter(h =>
                            h.location.toLowerCase().includes(trail.name.split(' ')[0].toLowerCase())
                          );
                          alert(`${trail.name} Details:\n\n📍 Location: ${trail.location}\n⛰️ Max Elevation: ${trail.elevation}\n📅 Duration: ${trail.duration}\n\n🚨 Pollution Reports:\n${trailHotspots.map(h =>
                            `• ${h.title} (${h.priority} priority)\n  Location: ${h.location}\n  Reports: ${h.reports}`
                          ).join('\n\n') || 'No specific hotspots found for this trail.'}`);
                        }}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'log':
        return (
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Camera size={20} className="text-green-500" />
                Log Waste Collection
              </h2>

              <button
                onClick={() => setShowWasteForm(true)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg mb-4 flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-colors"
              >
                <Plus size={18} />
                New Waste Entry
              </button>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-lg text-center">
                  <Trash2 className="mx-auto mb-1 text-green-600" size={24} />
                  <p className="font-bold text-green-800">{userStats.wasteCollected} kg</p>
                  <p className="text-sm text-green-600">Total Collected</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg text-center">
                  <MapPin className="mx-auto mb-1 text-blue-600" size={24} />
                  <p className="font-bold text-blue-800">{userStats.hotspotsReported}</p>
                  <p className="text-sm text-blue-600">Hotspots Reported</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold mb-3">Recent Entries</h3>
              <div className="space-y-3">
                {wasteEntries.map(entry => (
                  <div key={entry.id} className="border-l-4 border-green-500 pl-3 py-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{entry.type}</p>
                        <p className="text-sm text-gray-600">{entry.location}</p>
                        <p className="text-xs text-gray-500">{entry.date}</p>
                        {entry.photo && (
                          <div className="mt-2">
                            <img
                              src={entry.photo}
                              alt="Waste evidence"
                              className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                              onClick={() => {
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                modal.innerHTML = `
                                  <div class="relative max-w-2xl max-h-[90vh]">
                                    <img src="${entry.photo}" alt="Waste evidence" class="max-w-full max-h-full object-contain rounded" />
                                    <button class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600" onclick="this.parentElement.parentElement.remove()">×</button>
                                  </div>
                                `;
                                document.body.appendChild(modal);
                                modal.addEventListener('click', (e) => {
                                  if (e.target === modal) modal.remove();
                                });
                              }}
                            />
                            <p className="text-xs text-gray-400 mt-1">📷 Photo evidence</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {entry.verified ? (
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Verified
                          </div>
                        ) : (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            Pending
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'community':
        return (
          <div className="p-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-2">Community Events</h2>
              <p className="text-purple-100">Join fellow trekkers in organized cleanup drives</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                Upcoming Events
              </h3>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.location}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {event.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users size={14} />
                        <span>{event.participants} participants</span>
                      </div>
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={joinedEvents.includes(event.id)}
                        className={`px-4 py-1 rounded text-sm transition-colors ${
                          joinedEvents.includes(event.id)
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {joinedEvents.includes(event.id) ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold mb-3">Local Leaderboard</h3>
              <div className="space-y-2">
                {[
                  { name: userStats.name, points: userStats.points, rank: 1, isYou: true },
                  ...(userStats.points < 2000 ? [{ name: 'Eco Warrior', points: 2150, rank: 2, isYou: false }] : []),
                  ...(userStats.points < 1800 ? [{ name: 'Green Guardian', points: 1875, rank: userStats.points < 2000 ? 3 : 2, isYou: false }] : []),
                  ...(userStats.points < 1500 ? [{ name: 'Nature Protector', points: 1620, rank: userStats.points < 1800 ? (userStats.points < 2000 ? 4 : 3) : 2, isYou: false }] : [])
                ]
                .sort((a, b) => b.points - a.points)
                .map((user, idx) => ({ ...user, rank: idx + 1 }))
                .map((user, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2 rounded ${user.isYou ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${user.rank === 1 ? 'text-yellow-600' : user.rank === 2 ? 'text-gray-500' : user.rank === 3 ? 'text-orange-600' : 'text-gray-600'}`}>
                        #{user.rank}
                      </span>
                      <span className={user.isYou ? 'font-bold text-green-800' : 'text-gray-700'}>
                        {user.isYou ? `${user.name} (You)` : user.name}
                      </span>
                    </div>
                    <span className="font-semibold">{user.points} pts</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Rankings based on local cleanup activities
              </p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="p-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Mountain size={32} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-white bg-opacity-20 text-white placeholder-blue-200 border border-white border-opacity-30 rounded px-3 py-1 text-xl font-bold text-center"
                        placeholder="Enter your name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setUserStats(prev => ({ ...prev, name: tempName.trim() || prev.name }));
                            setEditingName(false);
                          } else if (e.key === 'Escape') {
                            setEditingName(false);
                            setTempName('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          setUserStats(prev => ({ ...prev, name: tempName.trim() || prev.name }));
                          setEditingName(false);
                        }}
                        className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{userStats.name}</h2>
                      <button
                        onClick={() => {
                          setEditingName(true);
                          setTempName(userStats.name);
                        }}
                        className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-blue-100">Level 8 • {userStats.points} points</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <Trash2 className="mx-auto mb-2 text-green-500" size={24} />
                <p className="text-2xl font-bold text-gray-800">{userStats.wasteCollected}</p>
                <p className="text-sm text-gray-600">kg collected</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <Users className="mx-auto mb-2 text-blue-500" size={24} />
                <p className="text-2xl font-bold text-gray-800">{userStats.cleanupEvents}</p>
                <p className="text-sm text-gray-600">events joined</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Award size={18} className="text-yellow-500" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {getAchievements().map((achievement, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      alert(`${achievement.name}\n\n${achievement.description}\n\nRequirement: ${achievement.requirement}\n\nStatus: ${achievement.unlocked ? '✅ Unlocked!' : '🔒 Locked'}`);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      achievement.unlocked
                        ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <p className={`text-sm font-medium ${achievement.unlocked ? 'text-yellow-800' : 'text-gray-500'}`}>
                        {achievement.name}
                      </p>
                      {achievement.unlocked && (
                        <div className="text-xs text-yellow-600 mt-1">✅ Unlocked</div>
                      )}
                      {!achievement.unlocked && (
                        <div className="text-xs text-gray-400 mt-1">🔒 Locked</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold mb-3">Impact Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Carbon footprint reduced</span>
                  <span className="font-bold">45 kg CO₂</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trails cleaned</span>
                  <span className="font-bold">12 locations</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Community rank</span>
                  <span className="font-bold">Top 15%</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const WasteEntryForm = () => {
    const [formData, setFormData] = useState({
      type: '',
      location: '',
      photo: null as string | null,
      lat: null as number | null,
      lng: null as number | null
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.type && formData.location) {
        handleAddWasteEntry(formData);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData({
            ...formData,
            photo: event.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    };

    const handleCameraCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        video.addEventListener('loadedmetadata', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context?.drawImage(video, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg');
          setFormData({
            ...formData,
            photo: dataURL
          });
          stream.getTracks().forEach(track => track.stop());
        });
      } catch (error) {
        alert('Camera access denied or not available. Please use file upload instead.');
      }
    };

    const removePhoto = () => {
      setFormData({
        ...formData,
        photo: null
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Log Waste Collection</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Waste Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select waste type</option>
                <option value="Plastic bottles">Plastic bottles</option>
                <option value="Food packaging">Food packaging</option>
                <option value="Batteries">Batteries</option>
                <option value="Cans/Metal">Cans/Metal</option>
                <option value="Glass">Glass</option>
                <option value="Paper/Cardboard">Paper/Cardboard</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <div className="space-y-2">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Everest Base Camp Trail"
                  required
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentLocation) {
                        setFormData({
                          ...formData,
                          lat: currentLocation.lat,
                          lng: currentLocation.lng
                        });
                      } else {
                        getCurrentLocation();
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    <Locate size={14} />
                    Use My Location
                  </button>
                  {(formData.lat && formData.lng) ? (
                    <span className="text-xs text-gray-600">
                      📍 {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                    </span>
                  ) : currentLocation ? (
                    <span className="text-xs text-gray-500">
                      Available: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Location not available</span>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Photo Evidence (Optional)</label>
              {!formData.photo ? (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600 mb-3">Add a photo of the waste</p>

                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={handleCameraCapture}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        <Camera size={14} />
                        Camera
                      </button>

                      <label className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 cursor-pointer">
                        <Upload size={14} />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={formData.photo}
                    alt="Waste evidence"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: null })}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowWasteForm(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Log Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const HotspotReportForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      location: '',
      priority: 'MEDIUM',
      description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.title && formData.location) {
        handleAddHotspot(formData);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Report Pollution Hotspot</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hotspot Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Heavy plastic accumulation"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Everest Base Camp Trail, km 15"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Describe the pollution situation..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowHotspotForm(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Report Hotspot
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Mountain size={28} />
          <div>
            <h1 className="text-xl font-bold">Himalayan Cleanup</h1>
            <p className="text-green-100 text-sm">Preserve the peaks, one step at a time</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <TabContent />
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around">
          {[
            { id: 'map', icon: MapPin, label: 'Map' },
            { id: 'log', icon: Camera, label: 'Log' },
            { id: 'community', icon: Users, label: 'Community' },
            { id: 'profile', icon: Award, label: 'Profile' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                currentTab === tab.id
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Waste Entry Form Modal */}
      {showWasteForm && <WasteEntryForm />}

      {/* Hotspot Report Form Modal */}
      {showHotspotForm && <HotspotReportForm />}

      {/* Achievement Notifications */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newAchievements.map((achievementName, idx) => {
            const achievement = getAchievements().find(a => a.name === achievementName);
            return achievement ? (
              <div
                key={idx}
                className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg animate-bounce border-2 border-yellow-400"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-bold">Achievement Unlocked!</div>
                    <div className="text-sm">{achievement.name}</div>
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

export default App;