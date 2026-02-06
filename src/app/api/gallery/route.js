import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const year = searchParams.get('year');

    const where = { isActive: true };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (year) {
      where.year = year;
    }

    const galleries = await prisma.gallery.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { year: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, data: galleries });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, name, year, image, photoProfile, description, order } = body;

    // Validate required fields
    if (!title || !name || !year || !image) {
      return NextResponse.json(
        { success: false, error: 'Field wajib: title, name, year, dan image harus diisi' },
        { status: 400 }
      );
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        name,
        year,
        image,
        photoProfile: photoProfile || '',
        description: description || '',
        order: order || 0,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, data: gallery });
  } catch (error) {
    console.error('Error creating gallery:', error);
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
        { success: false, error: 'Gallery ID is required' },
        { status: 400 }
      );
    }

    const gallery = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({ success: true, data: gallery });
  } catch (error) {
    console.error('Error updating gallery:', error);
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
        { success: false, error: 'Gallery ID is required' },
        { status: 400 }
      );
    }

    await prisma.gallery.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: 'Gallery deleted' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
