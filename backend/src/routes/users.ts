import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        rank: true,
        points: true,
        createdAt: true,
        _count: {
          select: {
            wasteEntries: true,
            hotspots: true,
            eventRegistrations: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    }

    // Calculate total waste collected
    const wasteStats = await prisma.wasteEntry.aggregate({
      where: { userId: req.user!.userId },
      _sum: { weight: true }
    });

    const profile = {
      ...user,
      wasteCollected: wasteStats._sum.weight || 0,
      hotspotsReported: user._count.hotspots,
      cleanupEvents: user._count.eventRegistrations
    };

    res.json({
      success: true,
      data: profile
    } as ApiResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        points: true,
        rank: true
      },
      orderBy: { points: 'desc' },
      take: 50
    });

    const leaderboard = users.map((user: any, index: number) => ({
      ...user,
      position: index + 1
    }));

    res.json({
      success: true,
      data: leaderboard
    } as ApiResponse);

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;