import { fetchAllAlbumsInMainFolder } from "@/lib/getImageCloudinary";

export default async function GalleryPage() {
  // เรียกใช้ฟังก์ชันใหม่ และใส่ชื่อโฟลเดอร์หลักของคุณ
  const allAlbums = await fetchAllAlbumsInMainFolder('samples'); 
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">แกลเลอรีรวมกิจกรรม</h1>

      {allAlbums.length === 0 && <p>ไม่พบอัลบั้มภาพ</p>}

      {allAlbums.map((album) => (
        <div key={album.id} className="mb-12 border-b pb-8">
          
          <div className="mb-4">
            <h2 className="text-2xl font-bold capitalize">{album.title}</h2>
            <p className="text-gray-500">{album.date}</p>
          </div>
          
          <div className="mb-6">
             <p className="font-semibold text-sm mb-2 text-blue-600">รูปหน้าปก:</p>
             <img src={album.coverUrl} alt="Cover" className="h-64 w-full object-cover rounded-xl" />
          </div>

          <p className="font-semibold text-sm mb-2 text-gray-700">รูปทั้งหมดในอัลบั้ม:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {album.images.map((img) => (
              <div key={img.id} className="border rounded-lg overflow-hidden bg-gray-50">
                <img src={img.url} alt={img.caption} className="w-full h-32 object-cover" />
                <p className="text-xs mt-2 text-center pb-2 truncate px-2">{img.caption}</p>
              </div>
            ))}
          </div>
          
        </div>
      ))}
    </div>
  );
}