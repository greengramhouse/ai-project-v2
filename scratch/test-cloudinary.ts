import * as dotenv from 'dotenv';
dotenv.config();

import { fetchAllAlbumsInMainFolder } from "../lib/getImageCloudinary";

async function test() {
  console.log("Testing Cloudinary connection...");
  console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  
  try {
    const albums = await fetchAllAlbumsInMainFolder('samples');
    console.log("SUCCESS! Found", albums.length, "albums.");
    if (albums.length > 0) {
      console.log("Album 1:", albums[0].title);
      console.log("Cover URL:", albums[0].coverUrl);
    }
  } catch (e: any) {
    console.error("STILL FAILED:", e.message);
  }
}

test();
