import { cacheLife, cacheTag } from 'next/cache';
import { firebaseAdmin } from './firebase-admin';

export async function getPublicNews() {
  'use cache';
  cacheLife('hours');
  cacheTag('news');

  try {
    const snapshot = await firebaseAdmin.collection('news').get();

    const fetchedNews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    fetchedNews.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return fetchedNews;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}