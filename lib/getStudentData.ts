import { firebaseAdmin } from "./firebase-admin";
import { unstable_noStore as noStore } from "next/cache";

export async function getStudentData() {
    noStore();

    try {
        const snapshot = await firebaseAdmin.collection('students').get();

        const studentData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || null
        }));

        studentData.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return studentData;
    } catch (error) {
        console.error("Error", error);
        return [];
    }
}