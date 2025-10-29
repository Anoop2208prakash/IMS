import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        sID: true,
        role: true,
        student: {
          select: {
            admissionDate: true,
            photoUrl: true,
            phoneNumber: true,
            bloodGroup: true,
          }
        },
        teacher: {
          select: {
            department: true,
            dateJoined: true,
          }
        },
        // --- THIS IS THE FIX ---
        // Enrollments are on the User, not the Student
        enrollments: {
          take: 1, // We only need one to find the program
          select: {
            subject: {
              select: {
                semester: {
                  select: {
                    program: {
                      select: {
                        title: true,
                        durationYears: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // Format the student data to match what the frontend expects
    const studentData = userProfile.student ? {
      ...userProfile.student,
      // Get program data from the top-level enrollments
      programName: userProfile.enrollments[0]?.subject?.semester?.program?.title || 'N/A',
      durationYears: userProfile.enrollments[0]?.subject?.semester?.program?.durationYears || 0,
    } : null;

    // Build the final, clean profile object
    const profileResponse = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      sID: userProfile.sID,
      role: userProfile.role,
      student: studentData,
      teacher: userProfile.teacher,
    };

    res.status(200).json(profileResponse);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};