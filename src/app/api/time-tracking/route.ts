// app/api/time-tracking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Handle time in
    if (action === 'time_in') {
      // First, find or create user
      let user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email
          }
        });
        console.log('Created new user:', user);
      }

      // Create time stamp record with time_in only
      const timeStamp = await prisma.timeStamp.create({
        data: {
          user_id: user.id,
          time_in: new Date(),
          // time_out and duration will be null initially
        }
      });

      return NextResponse.json({
        message: 'Time in recorded successfully',
        user,
        timeStamp
      });
    }

    // Handle time out
    if (action === 'time_out') {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Find the most recent timestamp without a time_out
      const recentTimeStamp = await prisma.timeStamp.findFirst({
        where: {
          user_id: user.id,
          time_out: null  // Find entries where time_out hasn't been set
        },
        orderBy: {
          time_in: 'desc'
        }
      });

      if (recentTimeStamp) {
        const timeOutDate = new Date();
        const timeInDate = new Date(recentTimeStamp.time_in);
        
        // Calculate duration in seconds
        const durationInSeconds = Math.floor((timeOutDate.getTime() - timeInDate.getTime()) / 1000);

        // Update the time_out and duration
        const updatedTimeStamp = await prisma.timeStamp.update({
          where: {
            id: recentTimeStamp.id
          },
          data: {
            time_out: timeOutDate,
            duration: durationInSeconds
          }
        });

        return NextResponse.json({
          message: 'Time out recorded successfully',
          timeStamp: updatedTimeStamp,
          duration: durationInSeconds
        });
      } else {
        return NextResponse.json(
          { error: 'No active session found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in time tracking API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handle sendBeacon requests (which send data as plain text)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);
    
    // Reuse the POST logic
    const mockRequest = {
      json: () => Promise.resolve(data)
    } as NextRequest;
    
    return POST(mockRequest);
  } catch (error) {
    console.error('Error handling sendBeacon request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}