import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    const eventsWithParticipants = events.map((event: any) => ({
      ...event,
      participants: event._count.registrations
    }));

    res.json({
      success: true,
      data: eventsWithParticipants
    } as ApiResponse);

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

// Join event
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: { select: { registrations: true } }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      } as ApiResponse);
    }

    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      } as ApiResponse);
    }

    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: req.user!.userId,
          eventId: id
        }
      }
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      } as ApiResponse);
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        userId: req.user!.userId,
        eventId: id
      }
    });

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Successfully joined event'
    } as ApiResponse);

  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;