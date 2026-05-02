import liff from "@line/liff";
import Swal from "sweetalert2";

const getHexColor = (colorClass: string) => {
  if (!colorClass) return "#3b82f6"; // Default blue
  if (colorClass.includes("red")) return "#ef4444";
  if (colorClass.includes("green") || colorClass.includes("emerald")) return "#10b981";
  if (colorClass.includes("yellow") || colorClass.includes("orange")) return "#f59e0b";
  if (colorClass.includes("purple")) return "#8b5cf6";
  if (colorClass.includes("pink")) return "#ec4899";
  if (colorClass.includes("gray")) return "#6b7280";
  return "#3b82f6";
};

const getFirstImage = (news: any) => {
  if (news.images && Array.isArray(news.images) && news.images.length > 0) {
    const url = news.images[0];
    if (typeof url === "string" && url.startsWith("https://")) return url;
  }
  if (news.image && typeof news.image === "string" && news.image.startsWith("https://")) {
    return news.image;
  }
  if (news.content && typeof news.content === "string") {
    const match = news.content.match(/<img[^>]+src="([^">]+)"/);
    if (match && match[1] && match[1].startsWith("https://")) {
      return match[1];
    }
  }
  return null;
};

export const shareNews = async (news: any) => {
  const newsUrl = `${window.location.origin}/liff-front/newlist/${news.id}`;
  const firstImage = getFirstImage(news);

  if (liff.isLoggedIn() && liff.isInClient() && liff.isApiAvailable("shareTargetPicker")) {
    try {
      const flexMessage = {
        type: "flex",
        altText: `ข่าวใหม่: ${news.title}`,
        contents: {
          type: "bubble",
          size: "mega",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: news.tag || "ข่าวสาร",
                color: "#ffffff",
                weight: "bold",
                size: "sm"
              }
            ],
            backgroundColor: getHexColor(news.color),
            paddingAll: "12px"
          },
          ...(firstImage ? {
            hero: {
              type: "image",
              url: firstImage,
              size: "full",
              aspectRatio: "20:13",
              aspectMode: "cover"
            }
          } : {}),
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: news.title || "ไม่มีหัวข้อข่าว",
                weight: "bold",
                size: "lg",
                wrap: true
              },
              {
                type: "text",
                text: `📅 ${news.date || "-"}`,
                size: "sm",
                color: "#8c8c8c",
                margin: "md",
                wrap: true
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "primary",
                height: "sm",
                color: getHexColor(news.color),
                action: {
                  type: "uri",
                  label: "อ่านเพิ่มเติม",
                  uri: newsUrl
                }
              }
            ],
            flex: 0
          }
        }
      };

      const result = await liff.shareTargetPicker([flexMessage as any]);
      if (result) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "แชร์ข่าวสารเรียบร้อยแล้ว",
          confirmButtonColor: "#06C755",
        });
      } else {
        console.log("User cancelled ShareTargetPicker");
      }
    } catch (error) {
      console.error("Error sharing via ShareTargetPicker", error);
      fallbackShare(news, newsUrl);
    }
  } else {
    // Outside LINE or shareTargetPicker not available
    fallbackShare(news, newsUrl);
  }
};

const fallbackShare = async (news: any, url: string) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: news.title,
        text: `อ่านข่าวสาร: ${news.title}`,
        url: url,
      });
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "แชร์ข่าวสารเรียบร้อยแล้ว",
        confirmButtonColor: "#06C755",
      });
    } else {
      await navigator.clipboard.writeText(url);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "คัดลอกลิงก์ข่าวสารแล้ว",
        confirmButtonColor: "#06C755",
      });
    }
  } catch (error) {
    console.error("Error fallback sharing", error);
  }
};
