import { v2 as cloudinary } from 'cloudinary';
import { cacheLife, cacheTag } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface AlbumImage {
  id: number;
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
  cacheLife('hours');
  cacheTag('gallery');  
  

  try {
    // ✅ จุดที่แก้ไข 1: เปลี่ยนจาก subfolders() เป็น sub_folders()
    // และเนื่องจาก SDK เก่าบางตัวมันใช้ Callback เราต้องห่อด้วย Promise เผื่อไว้ครับ
    const getSubFolders = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        // ใช้คำสั่ง sub_folders (มี underscore)
        cloudinary.api.sub_folders(mainFolder, (error: any, result: any) => {
           if (error) reject(error);
           else resolve(result);
        });
      });
    };

    // เรียกใช้ฟังก์ชันที่เราห่อไว้
    const subfoldersResult = await getSubFolders();
    const folders: CloudinaryFolder[] = subfoldersResult.folders; 

    // ✅ จุดที่แก้ไข 2: ป้องกันกรณีไม่มีโฟลเดอร์ย่อยเลย
    if (!folders || folders.length === 0) {
      console.log(`ไม่พบโฟลเดอร์ย่อยใน ${mainFolder}`);
      return [];
    }

    const albumsPromises = folders.map(async (folder: CloudinaryFolder) => {
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
          id: index + 1,
          url: img.secure_url,
          caption: img.filename.replace(/-/g, ' ') 
        }))
      } as AlbumData;
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
        id: index + 1,
        url: img.secure_url,
        caption: img.filename.replace(/-/g, ' ')
      }))
    } as AlbumData;

  } catch (error) {
    console.error(`Error fetching single album ${folderName}:`, error);
    return null;
  }
}


export async function fetchAllAlbumsInMainFolderTest(mainFolder: string): Promise<AlbumData[]> {

  try {
    // ✅ จุดที่แก้ไข 1: เปลี่ยนจาก subfolders() เป็น sub_folders()
    // และเนื่องจาก SDK เก่าบางตัวมันใช้ Callback เราต้องห่อด้วย Promise เผื่อไว้ครับ
    const getSubFolders = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        // ใช้คำสั่ง sub_folders (มี underscore)
        cloudinary.api.sub_folders(mainFolder, (error: any, result: any) => {
           if (error) reject(error);
           else resolve(result);
        });
      });
    };

    // เรียกใช้ฟังก์ชันที่เราห่อไว้
    const subfoldersResult = await getSubFolders();
    const folders: CloudinaryFolder[] = subfoldersResult.folders; 

    // ✅ จุดที่แก้ไข 2: ป้องกันกรณีไม่มีโฟลเดอร์ย่อยเลย
    if (!folders || folders.length === 0) {
      console.log(`ไม่พบโฟลเดอร์ย่อยใน ${mainFolder}`);
      return [];
    }

    const albumsPromises = folders.map(async (folder: CloudinaryFolder) => {
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
          id: index + 1,
          url: img.secure_url,
          caption: img.filename.replace(/-/g, ' ') 
        }))
      } as AlbumData;
    });

    const albums = await Promise.all(albumsPromises);
    return albums.filter((album): album is AlbumData => album !== null);

  } catch (error) {
    console.error(`Error fetching albums from ${mainFolder}:`, error);
    return [];
  }
}