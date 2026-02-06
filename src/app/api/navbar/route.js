import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET all navbar items
export async function GET() {
  try {
    const items = await prisma.navbarItem.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Error fetching navbar items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navbar items' },
      { status: 500 }
    )
  }
}

// POST create new navbar item
export async function POST(request) {
  try {
    const body = await request.json()
    const { label, href, order, isActive } = body

    if (!label || !href) {
      return NextResponse.json(
        { success: false, error: 'Label and href are required' },
        { status: 400 }
      )
    }

    const item = await prisma.navbarItem.create({
      data: {
        label,
        href,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Error creating navbar item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create navbar item' },
      { status: 500 }
    )
  }
}

// PUT update navbar item
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, label, href, order, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    const item = await prisma.navbarItem.update({
      where: { id },
      data: {
        label: label || undefined,
        href: href || undefined,
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Error updating navbar item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update navbar item' },
      { status: 500 }
    )
  }
}

// DELETE navbar item
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.navbarItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Navbar item deleted' })
  } catch (error) {
    console.error('Error deleting navbar item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete navbar item' },
      { status: 500 }
    )
  }
}
