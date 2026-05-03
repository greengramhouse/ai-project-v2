// ข้อมูล Mock สำหรับ Gallery (แต่ละกลุ่มภาพ)
export type GalleryImage = {
  id: number;
  url: string;
  caption?: string;
};

export type GalleryGroup = {
  id: string;
  title: string;
  coverUrl: string;
  date: string;
  images: GalleryImage[];
};

export const galleryGroups: GalleryGroup[] = [
  {
    id: "sports-day-68",
    title: "กีฬาสี ปีการศึกษา 2568",
    date: "15 ม.ค. 2568",
    coverUrl: "https://res.cloudinary.com/djkbdwnsc/image/upload/f_auto,q_auto/v1695867536/samples/woman-on-a-football-field.jpg",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop", caption: "พิธีเปิดกีฬาสี" },
      { id: 2, url: "https://res.cloudinary.com/djkbdwnsc/image/upload/f_auto,q_auto/v1695867536/samples/woman-on-a-football-field.jpg", caption: "การแข่งขันวิ่ง 100 เมตร" },
      { id: 3, url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=800&auto=format&fit=crop", caption: "การแข่งขันกระโดดสูง" },
      { id: 4, url: "https://images.unsplash.com/photo-1570498839593-e565b39455fc?q=80&w=800&auto=format&fit=crop", caption: "นักกีฬาทีมแดง" },
      { id: 5, url: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?q=80&w=800&auto=format&fit=crop", caption: "พิธีปิดมอบรางวัล" },
      { id: 6, url: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800&auto=format&fit=crop", caption: "ทีมสี ฉลองชัย" },
    ],
  },
  {
    id: "camp-2568",
    title: "เข้าค่ายลูกเสือ 2568",
    date: "20 ก.พ. 2568",
    coverUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop", caption: "เปิดค่ายลูกเสือ" },
      { id: 2, url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop", caption: "กิจกรรมผจญภัย" },
      { id: 3, url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800&auto=format&fit=crop", caption: "เรียนรู้ทักษะชีวิต" },
      { id: 4, url: "https://images.unsplash.com/photo-1598545068988-ff7f1fe28d3b?q=80&w=800&auto=format&fit=crop", caption: "นั่งสมาธิก่อนนอน" },
    ],
  },
  {
    id: "meeting-2568",
    title: "ประชุมผู้ปกครอง 2568",
    date: "5 มี.ค. 2568",
    coverUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop", caption: "บรรยากาศการประชุม" },
      { id: 2, url: "https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=800&auto=format&fit=crop", caption: "ผู้อำนวยการกล่าวเปิด" },
      { id: 3, url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop", caption: "ผู้ปกครองรับฟัง" },
    ],
  },
  {
    id: "award-2568",
    title: "รับรางวัลเด็กดีศรีสังคม 2568",
    date: "10 เม.ย. 2568",
    coverUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop", caption: "มอบรางวัลเด็กดี" },
      { id: 2, url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=800&auto=format&fit=crop", caption: "นักเรียนรับโล่รางวัล" },
      { id: 3, url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop", caption: "ภาพหมู่ร่วมกับผู้บริหาร" },
      { id: 4, url: "https://images.unsplash.com/photo-1546422904-90eab23c3d7e?q=80&w=800&auto=format&fit=crop", caption: "ร่วมแสดงความยินดี" },
    ],
  },
];
