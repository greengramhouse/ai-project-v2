import { getStudentData } from "@/lib/getStudentData";
import ComponentTest from "./Componenttest";

export default async function Page() {
  const studentData = await getStudentData();
    return (
        <main className="...">
            <h2>ทดสอบจ้าาา</h2>
            <ComponentTest initialStudents={studentData} />
        </main>
    );
}