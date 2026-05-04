import { fetchAllAlbumsInMainFolder } from "../lib/getImageCloudinary";

async function test() {
  try {
    const albums = await fetchAllAlbumsInMainFolder('samples');
    console.log("Albums count:", albums.length);
    if (albums.length > 0) {
      console.log("First album cover:", albums[0].coverUrl);
      console.log("First album first image ID:", albums[0].images[0]?.id);
    }
  } catch (e) {
    console.error("Test failed:", e);
  }
}

test();
