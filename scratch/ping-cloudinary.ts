import * as dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function check() {
  console.log("Pinging Cloudinary API directly...");
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.api.sub_folders('samples', (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    console.log("✅ SUCCESS! Cloudinary is ALIVE.");
    console.log("Folders found:", (result as any).folders?.length);
  } catch (e: any) {
    if (e.message.includes("Rate Limit Exceeded")) {
      console.log("❌ STILL BLOCKED: Rate limit exceeded.");
    } else {
      console.error("❌ ERROR:", e.message);
    }
  }
}

check();
