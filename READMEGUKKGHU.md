# 🚀 Next.js 16: Data Fetching, Caching & Architecture Guide

เอกสารฉบับนี้รวบรวม Best Practice สำหรับการพัฒนา Web Application ด้วย Next.js 16 (App Router) โดยเน้นไปที่การจัดการข้อมูล (Data Fetching), การทำระบบ Cache, และเทคนิคการเชื่อมต่อระหว่าง Frontend และ Backend

---

## 📦 1. การทำ Cache และการใช้ร่วมกับ `Suspense`

ใน Next.js 16 (ที่ทำงานบนฐานของ React 19) การจัดการ Cache ถูกทำให้ง่ายและทรงพลังขึ้นมากผ่าน Directive ใหม่คือ `'use cache'`

### 📌 คอนเซปต์ของ `'use cache'`
*   **ใช้เมื่อไหร่:** เมื่อต้องการจำผลลัพธ์ของฟังก์ชันที่ทำงานหนัก (เช่น ดึงข้อมูลจาก Database) ไว้ที่ Server เพื่อให้คนอื่นที่เข้ามาดูเว็บโหลดได้เร็วขึ้นโดยไม่ต้อง Query ใหม่
*   **ควบคุมอายุ:** ใช้ `cacheLife` กำหนดระยะเวลา
*   **ควบคุมการทำลาย:** ใช้ `cacheTag` แปะป้ายชื่อ เพื่อให้เราสั่งลบทิ้ง (Revalidate) ได้ทันทีเมื่อมีการแก้ไขข้อมูล

### 🎭 การใช้ `Suspense` ร่วมกับ Cache
`Suspense` คือตัวช่วยทำ **Streaming UI** ถ้าข้อมูลตรงไหนยังดึงไม่เสร็จ (หรือกำลังสร้าง Cache ใหม่) ให้โชว์หน้าโหลด (Fallback) ไปก่อน โดยที่ส่วนอื่นๆ ของเว็บยังทำงานได้ปกติ ไม่ต้องรอให้เสร็จพร้อมกันทั้งหน้า

**ตัวอย่างการใช้งานร่วมกัน (ดึงรายการเอกสาร):**
```tsx
// 1. Component หลัก (Server Component)
import { Suspense } from 'react';
import DocumentList from './DocumentList';

export default function DashboardPage() {
  return (
    <main>
      <h1>ระบบสารบรรณ</h1>
      
      <Suspense fallback="{<p">กำลังโหลดข้อมูล...</p>}>
        <DocumentList/>
      </Suspense>
    </main>
  );
}
```

```tsx
// 2. Component ที่ดึงข้อมูลและทำ Cache
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
import prisma from '@/lib/prisma';

export default async function DocumentList() {
  'use cache';
  cacheLife('hours');        // รอให้หมดอายุไปเองหลักชั่วโมง
  cacheTag('documents');     // แปะป้ายชื่อว่า documents

  // สมมติว่า Query นี้นาน 2 วินาที (Suspense ด้านบนจะทำงาน)
  const docs = await prisma.documentRegistry.findMany();

  return (
    <ul>
      {docs.map(doc => <li key={doc.id}>{doc.title}</li>)}
    </ul>
  );
}
```

---

## 🔥 2. กฎเหล็กการทำ Cache: Firebase vs SQL (Neon/Prisma)

ฐานข้อมูลแต่ละประเภทมีธรรมชาติไม่เหมือนกัน การฝืนใช้ Cache ผิดวิธีจะทำให้ระบบพังหรือข้อมูลไม่ตรงกัน

### 🆚 ความต่างของ Firebase และ SQL (Neon/PostgreSQL)

| คุณสมบัติ | SQL (Neon/Prisma) | Firebase (Firestore Client SDK) |
| :--- | :--- | :--- |
| **การเชื่อมต่อ** | Stateless (ขอข้อมูล -> ได้รับ -> ตัดจบ) | Stateful (เปิดท่อ WebSocket เชื่อมต่อค้างไว้) |
| **การอัปเดต** | ดึงใหม่เมื่อเราสั่ง (Pull) | เด้งเข้าเครื่องอัตโนมัติ (Push / Realtime) |
| **Next.js Cache** | **เข้ากันได้ 100%** เหมาะกับการทำ `'use cache'` มาก | **เข้ากันไม่ได้** หากใช้ Listener (`onSnapshot`) |

### ⚠️ กฎเหล็กเมื่อใช้ Firebase ใน Next.js
1.  **ห้ามทำ Server Cache กับ Real-time Listener:** ห้ามใช้ `'use cache'` ครอบฟังก์ชันที่มีคำสั่ง `onSnapshot` เด็ดขาด เพราะ Server ไม่สามารถจำสถานะการเชื่อมต่อแบบ Real-time ได้
2.  **ถ้าอยากทำ Cache บน Server ให้ใช้ Firebase Admin SDK:** ถ้าอยากดึงข้อมูลแบบครั้งเดียวจบแบบเดียวกับ Prisma เพื่อมาทำ SEO หรือ Cache ให้ใช้ไลบรารี `firebase-admin` (ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น)
3.  **Firebase Client มี Cache ของตัวเองอยู่แล้ว:** ถ้าใช้ SDK ฝั่งหน้าบ้าน (Client) แนะนำให้เปิดฟีเจอร์ `enableIndexedDbPersistence()` ของ Firebase ระบบจะจำข้อมูลไว้ในเครื่องผู้ใช้ให้เอง ไม่ต้องไปพึ่งระบบ Cache ของ Next.js

---

## 🔄 3. รูปแบบการรับส่งข้อมูล (Frontend ↔ Backend) ใน Next.js 16

ใน App Router ปัจจุบัน การรับส่งข้อมูลทำได้ **3 รูปแบบหลัก** ซึ่งครอบคลุมทุก Use Case ครับ

### แบบที่ 1: Server Components (อ่านข้อมูล / GET)
นี่คือท่ามาตรฐานสำหรับการ **ดึงข้อมูลมาแสดงผลเริ่มต้น** โค้ดจะรันบน Server และส่ง HTML กลับมาให้ผู้ใช้ ปลอดภัยสุดๆ เพราะข้อมูลและรหัสผ่าน Database ไม่หลุดไปหน้าบ้าน

**💻 ตัวอย่าง (ทำหน้าที่ทั้งหน้าบ้านและหลังบ้านในตัวเดียว):**
```tsx
// app/documents/page.tsx
import prisma from '@/lib/prisma';
import ClientChart from './ClientChart'; // สมมติว่าเป็น Component กราฟหน้าบ้าน

export default async function Page() {
  // 1. ดึงข้อมูลหลังบ้าน (Server)
  const docs = await prisma.documentRegistry.findMany();
  
  // 2. ส่ง UI กลับไปหน้าบ้าน (สามารถโยนข้อมูลที่ดึงมา ไปให้ Client Component ทำงานต่อได้)
  return (
    <div>
      <h1>รายการเอกสาร</h1>
      <ClientChart data="{docs}"/> 
    </div>
  );
}
```

---

### แบบที่ 2: Server Actions (เขียนข้อมูล / POST, PUT, DELETE)
ใช้สำหรับการ **รับข้อมูลจากหน้าบ้านมาบันทึกลงหลังบ้าน** (เช่น การกดปุ่ม หรือ ส่งฟอร์ม) ไม่ต้องสร้าง API Route ให้ยุ่งยาก แค่สร้างฟังก์ชันที่ใส่ `'use server'`

**💻 ตัวอย่างฝั่งหลังบ้าน (Backend):**
```tsx
// actions/document.ts
'use server';
import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

export async function createDocument(formData: FormData) {
  const title = formData.get('title') as string;
  await prisma.documentRegistry.create({ data: { title } });
  
  // สั่งทำลาย Cache ทันทีที่เซฟเสร็จ
  revalidateTag('documents');
  return { success: true };
}
```

**💻 ตัวอย่างฝั่งหน้าบ้าน (Frontend - Client Component):**
วิธีนี้เราจะใช้ร่วมกับ `useTransition` (หรือ `useActionState`) เพื่อทำสถานะ Loading ตอนกดบันทึกครับ
```tsx
// app/components/DocumentForm.tsx
'use client';
import { useTransition } from 'react';
import { createDocument } from '@/actions/document';

export default function DocumentForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // ใช้ startTransition เพื่อครอบการเรียก Server Action
    startTransition(async () => {
      await createDocument(formData);
      alert("ออกเลขเอกสารสำเร็จ!");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="ชื่อเอกสาร" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'กำลังบันทึกข้อมูล...' : 'ออกเลขเอกสาร'}
      </button>
    </form>
  );
}
```

---

### แบบที่ 3: Route Handlers (API ภายนอก / Fetch จากหน้าบ้านโดยตรง)
ใช้สำหรับสร้าง API Endpoints (`/api/...`) แบบดั้งเดิม ท่านี้มักใช้เมื่อ **ระบบภายนอก (Webhook) ยิงมาหาเรา** หรือเมื่อ **หน้าบ้านต้องการดึงข้อมูลใหม่เรื่อยๆ (Polling) โดยไม่รีเฟรชหน้า**

**💻 ตัวอย่างฝั่งหลังบ้าน (Backend API):**
```ts
// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const docs = await prisma.documentRegistry.findMany();
  return NextResponse.json(docs);
}
```

**💻 ตัวอย่างฝั่งหน้าบ้าน (Frontend - Client Component):**
เรียกใช้ API ด้วย `fetch` ธรรมดา หรือใช้ไลบรารีอย่าง `SWR` หรือ `React Query` (ในตัวอย่างใช้ fetch แบบมาตรฐานครับ)
```tsx
// app/components/LiveDocumentViewer.tsx
'use client';
import { useState } from 'react';

export default function LiveDocumentViewer() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันดึงข้อมูลจาก API แบบไม่ต้องโหลดหน้าเว็บใหม่
  const fetchLatestDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/documents');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ", error);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <button onClick={fetchLatestDocuments} disabled={isLoading}>
        {isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูลล่าสุด'}
      </button>

      <ul>
        {data.map((doc) => (
          <li key={doc.id}>{doc.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---
**💡 สรุปสั้นๆ (TL;DR):**
*   **ดึงข้อมูลตอนเปิดหน้าเว็บครั้งแรก:** โหลดด้วย Server Components (เรนเดอร์จากฝั่งเซิร์ฟเวอร์)
*   **ส่งฟอร์ม/กดปุ่มเซฟข้อมูล:** ใช้ หน้าบ้าน (`useTransition`) โยนไปหา หลังบ้าน (Server Actions)
*   **สร้าง API ให้ระบบอื่น หรือดึงข้อมูลแทรกระหว่างใช้งาน:** ใช้ `fetch` จากหน้าบ้าน ยิงไปหา Route Handlers (`app/api/...`)
````</HTMLFormElement>