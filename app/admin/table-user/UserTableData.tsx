import { getUserProfiles } from "@/app/liff-front/dashboard/actions";

export default async function UserTableData() {
    // 1. ดึงข้อมูลได้เลย ไม่ต้องใช้ useEffect
    // (ลองใส่หน่วงเวลาเพื่อดู Skeleton ตอนโหลด - ลบออกได้ตอนใช้งานจริง)
    const profile = await getUserProfiles();

    return (
        <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2 text-left">ID</th>
                    <th className="border p-2 text-left">Line User ID</th>
                    <th className="border p-2 text-left">Display Name</th>
                    <th className="border p-2 text-left">Role</th>
                </tr>
            </thead>
            <tbody>
                {profile.length > 0 ? (
                    profile.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="border p-2">{user.id}</td>
                            <td className="border p-2">{user.lineUserId}</td>
                            <td className="border p-2">{user.displayName}</td>
                            <td className="border p-2">{user.role}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="border p-4 text-center">ไม่พบข้อมูล</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}