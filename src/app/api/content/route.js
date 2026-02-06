import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/content - Fetch all page content or specific section
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    if (section) {
      // Fetch specific section
      const content = await prisma.pageContent.findUnique({
        where: {
          section: section,
          isActive: true,
        },
      });

      if (!content) {
        return NextResponse.json(
          { error: `Section '${section}' not found` },
          { status: 404 }
        );
      }

      // Parse JSON data if exists
      if (content.data) {
        try {
          content.data = JSON.parse(content.data);
        } catch (e) {
          console.error("Error parsing JSON data:", e);
        }
      }

      return NextResponse.json(content);
    }

    // Fetch all active content ordered
    const contents = await prisma.pageContent.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    // Parse JSON data for all contents
    const parsedContents = contents.map((content) => {
      if (content.data) {
        try {
          content.data = JSON.parse(content.data);
        } catch (e) {
          console.error("Error parsing JSON data:", e);
        }
      }
      return content;
    });

    return NextResponse.json(parsedContents);
  } catch (error) {
    console.error("Error fetching page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch page content" },
      { status: 500 }
    );
  }
}

// PUT /api/content - Update page content (for CMS)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { section, title, subtitle, content, image, data, isActive, order } = body;

    if (!section) {
      return NextResponse.json(
        { error: "Section is required" },
        { status: 400 }
      );
    }

    // Convert data object to JSON string if it's an object
    const dataString = typeof data === "object" ? JSON.stringify(data) : data;

    const updatedContent = await prisma.pageContent.upsert({
      where: { section },
      update: {
        title,
        subtitle,
        content,
        image,
        data: dataString,
        isActive,
        order,
      },
      create: {
        section,
        title,
        subtitle,
        content,
        image,
        data: dataString,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Error updating page content:", error);
    return NextResponse.json(
      { error: "Failed to update page content" },
      { status: 500 }
    );
  }
}

// DELETE /api/content - Delete page content (soft delete by setting isActive to false)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    if (!section) {
      return NextResponse.json(
        { error: "Section is required" },
        { status: 400 }
      );
    }

    const deletedContent = await prisma.pageContent.update({
      where: { section },
      data: { isActive: false },
    });

    return NextResponse.json(deletedContent);
  } catch (error) {
    console.error("Error deleting page content:", error);
    return NextResponse.json(
      { error: "Failed to delete page content" },
      { status: 500 }
    );
  }
}
