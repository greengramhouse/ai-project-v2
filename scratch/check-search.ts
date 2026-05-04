import * as dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function checkDetailed() {
  try {
    console.log("1. Fetching subfolders...");
    const subfoldersResult: any = await new Promise((resolve, reject) => {
      cloudinary.api.sub_folders('samples', (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    const folder = subfoldersResult.folders[0];
    if (!folder) {
      console.log("No folders found.");
      return;
    }

    console.log(`2. Searching in folder: ${folder.path}...`);
    const searchResult = await cloudinary.search
      .expression(`folder:${folder.path}`)
      .sort_by('public_id', 'desc')
      .execute();

    console.log(`✅ SUCCESS! Found ${searchResult.resources.length} images.`);
    if (searchResult.resources.length > 0) {
       console.log("First image URL:", searchResult.resources[0].secure_url);
    }

  } catch (e: any) {
    console.error("❌ ERROR during detailed check:", e.message);
  }
}

checkDetailed();
