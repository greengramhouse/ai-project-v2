import { getUserProfiles } from "./actions";
import UserManagementClient from "./UserManagementClient";


export default async function UserManagementPage() {
  const users = await getUserProfiles();
  return <UserManagementClient initialUsers={users} />;
}
