import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all waste entries for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const wasteEntries = await prisma.wasteEntry.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: wasteEntries
    } as ApiResponse);

  } catch (error) {
    console.error('Get waste entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

// Create new waste entry
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, weight, location, latitude, longitude, imageUrl } = req.body;

    if (!type || !weight || !location) {
      return res.status(400).json({
        success: false,
        message: 'Type, weight, and location are required'
      } as ApiResponse);
    }

    const wasteEntry = await prisma.wasteEntry.create({
      data: {
        type,
        weight: parseFloat(weight),
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        imageUrl,
        userId: req.user!.userId
      }
    });

    // Update user points (10 points per kg)
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        points: {
          increment: Math.round(weight * 10)
        }
      }
    });

    res.status(201).json({
      success: true,
      data: wasteEntry,
      message: 'Waste entry created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Create waste entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

// Get waste entry by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const wasteEntry = await prisma.wasteEntry.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    });

    if (!wasteEntry) {
      return res.status(404).json({
        success: false,
        message: 'Waste entry not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: wasteEntry
    } as ApiResponse);

  } catch (error) {
    console.error('Get waste entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

// Update waste entry
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { type, weight, location, latitude, longitude, imageUrl } = req.body;

    const existingEntry = await prisma.wasteEntry.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Waste entry not found'
      } as ApiResponse);
    }

    const updatedEntry = await prisma.wasteEntry.update({
      where: { id },
      data: {
        type: type || existingEntry.type,
        weight: weight ? parseFloat(weight) : existingEntry.weight,
        location: location || existingEntry.location,
        latitude: latitude ? parseFloat(latitude) : existingEntry.latitude,
        longitude: longitude ? parseFloat(longitude) : existingEntry.longitude,
        imageUrl: imageUrl !== undefined ? imageUrl : existingEntry.imageUrl
      }
    });

    res.json({
      success: true,
      data: updatedEntry,
      message: 'Waste entry updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update waste entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

// Delete waste entry
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const existingEntry = await prisma.wasteEntry.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Waste entry not found'
      } as ApiResponse);
    }

    await prisma.wasteEntry.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Waste entry deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete waste entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;