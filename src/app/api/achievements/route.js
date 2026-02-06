import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 'dosen' or 'mahasiswa'
    const format = searchParams.get('format'); // 'grouped' or 'list'
    const search = searchParams.get('search'); // search term

    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { achieverName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } }
      ];
    }

    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: [
        { tahun: 'desc' },
        { achieverName: 'asc' }
      ]
    });

    // Return raw list for admin
    if (format === 'list') {
      return NextResponse.json({ success: true, data: achievements });
    }

    // Group achievements by achieverName for public display
    const grouped = achievements.reduce((acc, achievement) => {
      const existing = acc.find(item => item.nama === achievement.achieverName);
      
      if (existing) {
        existing.pencapaian.push({
          nama: achievement.title,
          tingkatan: achievement.tingkatan,
          tahun: achievement.tahun
        });
      } else {
        acc.push({
          nama: achievement.achieverName,
          img: achievement.image,
          pencapaian: [{
            nama: achievement.title,
            tingkatan: achievement.tingkatan,
            tahun: achievement.tahun
          }]
        });
      }
      
      return acc;
    }, []);

    return NextResponse.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { achieverName, title, tingkatan, tahun, category, image, description } = body;

    if (!achieverName || !title || !tingkatan || !tahun || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.create({
      data: {
        achieverName,
        title,
        tingkatan,
        tahun,
        category,
        image,
        description
      }
    });

    return NextResponse.json({ success: true, data: achievement });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Achievement ID is required' },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({ success: true, data: achievement });
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Achievement ID is required' },
        { status: 400 }
      );
    }

    await prisma.achievement.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: 'Achievement deleted' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
