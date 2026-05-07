export default function TableSkeleton() {
    return (
        <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2 text-left">ID</th>
                    <th className="border p-2 text-left">Line User ID</th>
                    <th className="border p-2 text-left">Display Name</th>
                    {/* ใส่ Header ให้ครบตามต้องการ */}
                    <th className="border p-2 text-left">Role</th>
                </tr>
            </thead>
            <tbody>
                {/* สร้างแถวสีเทากะพริบ 5 แถว */}
                {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                        <td className="border p-2"><div className="h-5 bg-gray-200 rounded"></div></td>
                        <td className="border p-2"><div className="h-5 bg-gray-200 rounded"></div></td>
                        <td className="border p-2"><div className="h-5 bg-gray-200 rounded"></div></td>
                        <td className="border p-2"><div className="h-5 bg-gray-200 rounded"></div></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}