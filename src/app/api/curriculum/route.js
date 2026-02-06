import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/curriculum - Fetch curriculum data
export async function GET(request) {
  try {
    const content = await prisma.pageContent.findUnique({
      where: {
        section: "curriculum",
      },
    });

    if (!content) {
      // Return default curriculum structure if not found
      return NextResponse.json({
        section: "curriculum",
        title: "Kurikulum Program Studi",
        subtitle: "Sistem Informasi Bisnis",
        data: [],
      });
    }

    // Parse JSON data if exists
    if (content.data) {
      try {
        content.data = JSON.parse(content.data);
      } catch (e) {
        console.error("Error parsing JSON data:", e);
        content.data = [];
      }
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return NextResponse.json(
      { error: "Failed to fetch curriculum" },
      { status: 500 }
    );
  }
}

// PUT /api/curriculum - Update curriculum data
export async function PUT(request) {
  try {
    const body = await request.json();
    const { title, subtitle, data } = body;

    // Validate data structure
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Data must be an array of semesters" },
        { status: 400 }
      );
    }

    // Convert data object to JSON string
    const dataString = JSON.stringify(data);

    const updatedContent = await prisma.pageContent.upsert({
      where: { section: "curriculum" },
      update: {
        title: title || "Kurikulum Program Studi",
        subtitle: subtitle || "Sistem Informasi Bisnis",
        data: dataString,
        isActive: true,
      },
      create: {
        section: "curriculum",
        title: title || "Kurikulum Program Studi",
        subtitle: subtitle || "Sistem Informasi Bisnis",
        data: dataString,
        isActive: true,
        order: 0,
      },
    });

    // Parse data back for response
    updatedContent.data = JSON.parse(updatedContent.data);

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Error updating curriculum:", error);
    return NextResponse.json(
      { error: "Failed to update curriculum" },
      { status: 500 }
    );
  }
}

// POST /api/curriculum - Create or initialize curriculum
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, subtitle, data } = body;

    const dataString = JSON.stringify(data || []);

    const content = await prisma.pageContent.create({
      data: {
        section: "curriculum",
        title: title || "Kurikulum Program Studi",
        subtitle: subtitle || "Sistem Informasi Bisnis",
        data: dataString,
        isActive: true,
        order: 0,
      },
    });

    content.data = JSON.parse(content.data);
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error creating curriculum:", error);
    return NextResponse.json(
      { error: "Failed to create curriculum" },
      { status: 500 }
    );
  }
}

// DELETE /api/curriculum - Delete a specific course from a semester
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = parseInt(searchParams.get("semester"));
    const courseIndex = parseInt(searchParams.get("courseIndex"));

    if (!semester || courseIndex === null) {
      return NextResponse.json(
        { error: "Semester and courseIndex are required" },
        { status: 400 }
      );
    }

    const content = await prisma.pageContent.findUnique({
      where: { section: "curriculum" },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Curriculum not found" },
        { status: 404 }
      );
    }

    const data = JSON.parse(content.data);
    const semesterData = data.find((s) => s.semester === semester);

    if (!semesterData) {
      return NextResponse.json(
        { error: "Semester not found" },
        { status: 404 }
      );
    }

    // Remove the course
    semesterData.matkul.splice(courseIndex, 1);

    // Update database
    const updated = await prisma.pageContent.update({
      where: { section: "curriculum" },
      data: {
        data: JSON.stringify(data),
      },
    });

    updated.data = JSON.parse(updated.data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
