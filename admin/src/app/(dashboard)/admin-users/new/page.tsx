import { SectionHeading } from '@/components/common/SectionHeading';
import { AdminUserForm } from '@/components/admin-users/AdminUserForm';

export default function NewAdminUserPage() {
  return (
    <div>
      <SectionHeading title="New admin account" />
      <AdminUserForm />
    </div>
  );
}
