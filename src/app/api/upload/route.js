import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink, readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'uploads'

    const uploadDir = path.join(process.cwd(), 'public', folder)
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({ success: true, files: [] })
    }

    const files = await readdir(uploadDir)
    const fileList = files.map(filename => ({
      filename,
      url: `/${folder}/${filename}`
    }))

    return NextResponse.json({ success: true, files: fileList })
  } catch (error) {
    console.error('List files error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list files' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'uploads'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create folder if not exists
    const uploadDir = path.join(process.cwd(), 'public', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/\s+/g, '-')
    const filename = `${timestamp}-${originalName}`
    const filepath = path.join(uploadDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/${folder}/${filename}`

    return NextResponse.json({
      success: true,
      url,
      filename,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { oldUrl, newFilename } = await request.json()

    if (!oldUrl || !newFilename) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Construct file paths
    const oldRelativePath = oldUrl.startsWith('/') ? oldUrl.slice(1) : oldUrl
    const oldFilepath = path.join(process.cwd(), 'public', oldRelativePath)

    // Check if old file exists
    if (!existsSync(oldFilepath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Construct new file path (same folder)
    const folder = path.dirname(oldRelativePath)
    const newRelativePath = path.join(folder, newFilename)
    const newFilepath = path.join(process.cwd(), 'public', newRelativePath)

    // Check if new filename already exists
    if (existsSync(newFilepath)) {
      return NextResponse.json(
        { success: false, error: 'Filename already exists' },
        { status: 400 }
      )
    }

    // Rename file
    await writeFile(newFilepath, await readFile(oldFilepath))
    await unlink(oldFilepath)

    const newUrl = `/${newRelativePath.replace(/\\/g, '/')}`

    return NextResponse.json({
      success: true,
      url: newUrl,
      filename: newFilename,
      message: 'File renamed successfully'
    })
  } catch (error) {
    console.error('Rename error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to rename file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'No file URL provided' },
        { status: 400 }
      )
    }

    // Remove leading slash and construct file path
    const relativePath = url.startsWith('/') ? url.slice(1) : url
    const filepath = path.join(process.cwd(), 'public', relativePath)

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete file
    await unlink(filepath)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
