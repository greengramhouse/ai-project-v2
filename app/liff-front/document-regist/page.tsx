import { getDocumentRegistry } from "./actions";
import DocumentRegistClient from "./DocumentRegistClient";

export default async function DocumentRegistPage() {
  const data = await getDocumentRegistry();
  return <DocumentRegistClient initialData={data} />;
}