import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET page by slug
export async function GET(request, { params }) {
  try {
    const slug = params.slug

    // Find page by section (slug)
    const page = await prisma.pageContent.findUnique({
      where: { 
        section: slug,
        isActive: true
      }
    })

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}
