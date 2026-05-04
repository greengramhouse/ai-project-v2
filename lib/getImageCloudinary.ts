import { v2 as cloudinary } from 'cloudinary';

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

export async function fetchAllAlbumsInMainFolder(mainFolder: string): Promise<AlbumData[]> {
  try {
    // 1. Get subfolders using the API (more reliable for structure)
    const subfoldersResult = await new Promise<any>((resolve, reject) => {
      cloudinary.api.sub_folders(mainFolder, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    const folders = subfoldersResult.folders;
    if (!folders || folders.length === 0) return [];

    const albumsPromises = folders.map(async (folder: any) => {
      try {
        // 2. Get resources in the folder using the resources API
        // This is often more reliable than 'search' if indexing is slow
        const resourcesResult = await new Promise<any>((resolve, reject) => {
          cloudinary.api.resources({
            type: 'upload',
            prefix: folder.path,
            max_results: 100
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });

        const resources = resourcesResult.resources;
        if (!resources || resources.length === 0) return null;

        const uploadDate = new Date(resources[0].created_at).toLocaleDateString('th-TH', {
          year: 'numeric', month: 'short', day: 'numeric'
        });

        return {
          id: folder.name,
          title: folder.name.replace(/-/g, ' '),
          date: uploadDate,
          coverUrl: resources[0].secure_url,
          images: resources.map((img: any, index: number) => ({
            id: img.public_id || `img_${index}`,
            url: img.secure_url,
            caption: (img.filename || '').replace(/-/g, ' ')
          }))
        } as AlbumData;
      } catch (err) {
        console.error(`Error fetching resources for ${folder.path}:`, err);
        return null;
      }
    });

    const albums = await Promise.all(albumsPromises);
    return albums.filter((album): album is AlbumData => album !== null);

  } catch (error) {
    console.error("Error in fetchAllAlbumsInMainFolder:", error);
    return [];
  }
}

export async function fetchSingleAlbum(mainFolder: string, folderName: string): Promise<AlbumData | null> {
  try {
    const fullPath = `${mainFolder}/${folderName}`;
    const resourcesResult = await new Promise<any>((resolve, reject) => {
      cloudinary.api.resources({
        type: 'upload',
        prefix: fullPath,
        max_results: 500
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    const resources = resourcesResult.resources;
    if (!resources || resources.length === 0) return null;

    const uploadDate = new Date(resources[0].created_at).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return {
      id: folderName,
      title: folderName.replace(/-/g, ' '),
      date: uploadDate,
      coverUrl: resources[0].secure_url,
      images: resources.map((img: any, index: number) => ({
        id: img.public_id || `img_${index}`,
        url: img.secure_url,
        caption: (img.filename || '').replace(/-/g, ' ')
      }))
    } as AlbumData;
  } catch (error) {
    console.error(`Error in fetchSingleAlbum ${folderName}:`, error);
    return null;
  }
}

export async function fetchAllAlbumsInMainFolderTest(mainFolder: string): Promise<AlbumData[]> {
  return fetchAllAlbumsInMainFolder(mainFolder);
}