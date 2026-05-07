import { Suspense } from "react";
import UserTableData from "./UserTableData";
import TableSkeleton from "./TableSkeleton";


export default function PageTableUser() {
    return (
        <div className="p-4">
            <Suspense fallback={<TableSkeleton />}>
                <UserTableData />
            </Suspense>
        </div>
    );
}