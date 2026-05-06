import { firebaseAdmin } from "./firebase-admin";
import { connection } from "next/server";


export async function getUrlForDownload() {
    connection()
    try{
       const snapshot = await firebaseAdmin.collection('url_download').get();

       const url_download = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || null
        }));

        return url_download;
       
    }catch(error){
        console.error("Error", error);
        return [];
    }
}