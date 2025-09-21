import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all hotspots
router.get('/', async (req, res) => {
  try {
    const hotspots = await prisma.hotspot.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: hotspots
    } as ApiResponse);

  } catch (error) {
    console.error('Get hotspots error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

// Create new hotspot
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, latitude, longitude, priority } = req.body;

    if (!title || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Title, latitude, and longitude are required'
      } as ApiResponse);
    }

    const hotspot = await prisma.hotspot.create({
      data: {
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        priority: priority || 'MEDIUM',
        reportedBy: req.user!.userId
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: hotspot,
      message: 'Hotspot reported successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Create hotspot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;