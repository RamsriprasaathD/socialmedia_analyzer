import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Format date into "YYYY-MM-DD HH:mm:ss" for a given timezone
 */
function formatLocalTime(date: Date, timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value.padStart(2, '0') || '00';
    const day = parts.find(p => p.type === 'day')?.value.padStart(2, '0') || '00';
    const hour = parts.find(p => p.type === 'hour')?.value.padStart(2, '0') || '00';
    const minute = parts.find(p => p.type === 'minute')?.value.padStart(2, '0') || '00';
    const second = parts.find(p => p.type === 'second')?.value.padStart(2, '0') || '00';
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  } catch {
    return date.toISOString().replace('T', ' ').slice(0, 19); // fallback UTC
  }
}

/**
 * Convert offset string like "+0530" to "GMT+05:30"
 */
function formatGMTOffset(offset: string): string {
  if (!offset || offset === '+0000') return 'GMT+00:00';
  const sign = offset.startsWith('-') ? '-' : '+';
  const hours = offset.substring(1, 3);
  const minutes = offset.substring(3, 5);
  return `GMT${sign}${hours}:${minutes}`;
}

/**
 * Get geo info (country, timezone, GMT offset) based on IP
 */
async function getGeo(request: NextRequest) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',').map(ip => ip.trim())[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  if (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') {
    return { country: 'Unknown', timeZone: 'UTC', gmtOffset: 'GMT+00:00' };
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!res.ok) throw new Error('Failed to fetch geo data');
    const data = await res.json();

    return {
      country: data.country_name || 'Unknown',
      timeZone: data.timezone || 'UTC',
      gmtOffset: formatGMTOffset(data.utc_offset || '+0000'),
    };
  } catch (error) {
    console.error('Error fetching geo data:', error);
    return { country: 'Unknown', timeZone: 'UTC', gmtOffset: 'GMT+00:00' };
  }
}

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

    const geo = await getGeo(request);

    // ----------------- TIME IN -----------------
    if (action === 'time_in') {
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email,
          },
        });
        console.log('Created new user:', user);
      }

      const timeInDate = new Date();

      const timeStamp = await prisma.timeStamp.create({
        data: {
          user_id: user.id,
          time_in: timeInDate,
          country: geo.country,
          timeZone: geo.timeZone,
          utcOffset: geo.gmtOffset,   // Store GMT+ format
          localTimeIn: formatLocalTime(timeInDate, geo.timeZone),
        },
      });

      return NextResponse.json({
        message: 'Time in recorded successfully',
        user,
        timeStamp,
      });
    }

    // ----------------- TIME OUT -----------------
    if (action === 'time_out') {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const recentTimeStamp = await prisma.timeStamp.findFirst({
        where: {
          user_id: user.id,
          time_out: null,
        },
        orderBy: { time_in: 'desc' },
      });

      if (recentTimeStamp) {
        const timeOutDate = new Date();
        const timeInDate = new Date(recentTimeStamp.time_in);

        const durationInSeconds = Math.floor((timeOutDate.getTime() - timeInDate.getTime()) / 1000);

        const timeZone = recentTimeStamp.timeZone || 'UTC';

        const updatedTimeStamp = await prisma.timeStamp.update({
          where: { id: recentTimeStamp.id },
          data: {
            time_out: timeOutDate,
            duration: durationInSeconds,
            localTimeOut: formatLocalTime(timeOutDate, timeZone),
          },
        });

        return NextResponse.json({
          message: 'Time out recorded successfully',
          timeStamp: updatedTimeStamp,
          duration: durationInSeconds,
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    const mockRequest = {
      json: () => Promise.resolve(data),
      headers: request.headers,
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
