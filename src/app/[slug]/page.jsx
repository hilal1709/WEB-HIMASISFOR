import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SectionHero from '@/components/sections/SectionHero'
import SectionContent from '@/components/sections/SectionContent'
import SectionCard from '@/components/sections/SectionCard'
import { notFound } from 'next/navigation'

async function getPageData(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/page/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.success ? data.page : null
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

function renderSection(page) {
  // Determine section type based on data structure
  let sectionType = 'content' // default
  
  if (page.data) {
    try {
      const parsed = JSON.parse(page.data)
      sectionType = parsed.type || 'content'
    } catch (e) {
      // ignore parse error
    }
  }
  
  // Auto-detect based on section name
  if (page.section.includes('hero')) {
    sectionType = 'hero'
  } else if (page.section.includes('card') || page.section.includes('bidang')) {
    sectionType = 'card'
  }

  switch (sectionType) {
    case 'hero':
      return <SectionHero data={page} />
    case 'card':
      return <SectionCard data={page} />
    default:
      return <SectionContent data={page} />
  }
}

export async function generateMetadata({ params }) {
  const page = await getPageData(params.slug)
  
  if (!page) {
    return {
      title: 'Page Not Found'
    }
  }

  return {
    title: page.title || page.section,
    description: page.subtitle || page.content?.substring(0, 160),
  }
}

export default async function DynamicPage({ params }) {
  const page = await getPageData(params.slug)

  if (!page) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {renderSection(page)}
      </main>
      <Footer />
    </>
  )
}
