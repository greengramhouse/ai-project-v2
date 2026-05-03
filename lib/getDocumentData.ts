'use server';

import { firebaseAdmin } from "./firebase-admin";

const appId = process.env.APP_ID || "calendar-app";

export async function getDocumentData(currentUserId?: string, viewAll?: boolean) {
  try {
    const docsRef = firebaseAdmin
      .collection("artifacts")
      .doc(appId)
      .collection("public")
      .doc("data")
      .collection("documents");

    const snapshot = await docsRef.get();

    let fetchedDocs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (!viewAll) {
      fetchedDocs = fetchedDocs.filter((doc: any) =>
        doc.docLineUserId === currentUserId
      );
    }

    fetchedDocs.sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return fetchedDocs;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}
