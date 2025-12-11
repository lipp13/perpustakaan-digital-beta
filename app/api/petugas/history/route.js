import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // optional filter by status
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (userId) {
      where.userId = userId;
    } else if (session.user.role !== 'admin' && session.user.role !== 'petugas') {
      // Regular users can only see their own history
      where.userId = session.user.id;
    }
    
    if (status) {
      where.status = status;
    }

    // Get history
    const history = await prisma.peminjaman.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            coverImage: true,
          }
        },
        petugas: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.peminjaman.count({ where });

    return NextResponse.json({
      data: history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching peminjaman history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}