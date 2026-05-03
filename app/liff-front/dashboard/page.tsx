import { getUserProfiles } from "./actions";
import UserManagementClient from "./UserManagementClient";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const users = await getUserProfiles();
  return <UserManagementClient initialUsers={users} />;
}
