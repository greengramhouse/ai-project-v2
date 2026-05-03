import { NextResponse } from "next/server";
import { getStudentData } from "@/lib/getStudentData";
import { connection } from "next/server";

export async function GET() {
  await connection();
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
