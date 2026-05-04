import { v2 as cloudinary } from 'cloudinary';
import { cacheLife, cacheTag } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface AlbumImage {
  id: string;
  url: string;
  caption: string;
}

export interface AlbumData {
  id: string;
  title: string;
  date: string;
  coverUrl: string;
  images: AlbumImage[];
}

interface CloudinaryFolder {
  name: string;
  path: string;
}

interface CloudinaryResource {
  secure_url: string;
  created_at: string;
  filename: string;
  [key: string]: unknown;
}

export async function fetchAllAlbumsInMainFolder(mainFolder: string): Promise<AlbumData[]> {
  "use cache";
  cacheLife('hours'); // เก็บ Cache ไว้เป็นชั่วโมงเพื่อประหยัด API Limit
  cacheTag('gallery_v2');  
  
  try {
    const getSubFolders = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        cloudinary.api.sub_folders(mainFolder, (error: any, result: any) => {
           if (error) reject(error);
           else resolve(result);
        });
      });
    };

    const subfoldersResult = await getSubFolders();
    const folders: CloudinaryFolder[] = subfoldersResult.folders; 

    if (!folders || folders.length === 0) return [];

    const albumsPromises = folders.map(async (folder: CloudinaryFolder) => {
      try {
        const searchResult = await cloudinary.search
          .expression(`folder:${folder.path}`)
          .sort_by('public_id', 'desc')
          .max_results(20)
          .execute();

        const resources: CloudinaryResource[] = searchResult.resources;

        if (!resources || resources.length === 0) return null;

        const uploadDate = new Date(resources[0].created_at).toLocaleDateString('th-TH', {
          year: 'numeric', month: 'short', day: 'numeric'
        });

        return {
          id: folder.name, 
          title: folder.name.replace(/-/g, ' '), 
          date: uploadDate, 
          coverUrl: resources[0].secure_url, 
          images: resources.map((img: CloudinaryResource, index: number) => ({
            id: (img as any).public_id || `img_${index}`,
            url: img.secure_url,
            caption: img.filename.replace(/-/g, ' ') 
          }))
        } as AlbumData;
      } catch (err) {
        console.error("Cloudinary Search Error:", err);
        return null;
      }
    });

    const albums = await Promise.all(albumsPromises);
    return albums.filter((album): album is AlbumData => album !== null);

  } catch (error) {
    console.error(`Error fetching albums from ${mainFolder}:`, error);
    return [];
  }
}

export async function fetchSingleAlbum(mainFolder: string, folderName: string): Promise<AlbumData | null> {
  "use cache";
  cacheLife('hours');
  
  try {
    const fullPath = `${mainFolder}/${folderName}`;
    
    const searchResult = await cloudinary.search
      .expression(`folder:${fullPath}`)
      .sort_by('public_id', 'desc')
      .max_results(100)
      .execute();

    const resources: CloudinaryResource[] = searchResult.resources;

    if (!resources || resources.length === 0) return null;

    const uploadDate = new Date(resources[0].created_at).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return {
      id: folderName,
      title: folderName.replace(/-/g, ' '),
      date: uploadDate,
      coverUrl: resources[0].secure_url,
      images: resources.map((img: CloudinaryResource, index: number) => ({
        id: (img as any).public_id || `img_${index}`,
        url: img.secure_url,
        caption: img.filename.replace(/-/g, ' ')
      }))
    } as AlbumData;

  } catch (error) {
    console.error(`Error fetching single album ${folderName}:`, error);
    return null;
  }
}

