import { notFound } from "next/navigation";
import { galleryGroups } from "../data";
import GalleryGroupClient from "./GalleryGroupClient";

type Props = {
  params: Promise<{ groupId: string }>;
};

export async function generateStaticParams() {
  return galleryGroups.map((g) => ({ groupId: g.id }));
}

export default async function GalleryGroupPage({ params }: Props) {
  const { groupId } = await params;
  const group = galleryGroups.find((g) => g.id === groupId);

  if (!group) {
    notFound();
  }

  return <GalleryGroupClient group={group} />;
}
