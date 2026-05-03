export default function ComponentTest({initialStudents}: { initialStudents: any[] }) {
  console.log(initialStudents);
  return (
    <div>
      <h1>รายชื่อนักเรียน</h1>

      {initialStudents.map((student) => (
        <div key={student.id}>
          <p>{student.fullName} {student.grade} {student.room}</p>
        </div>
      ))}
    </div>
  );
}