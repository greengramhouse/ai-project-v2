import { NextResponse } from "next/server";
import { getStudentData } from "@/lib/getStudentData";

export async function GET() {
  try {
    const data = await getStudentData();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in student API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
