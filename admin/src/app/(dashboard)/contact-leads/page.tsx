import { getContactLeads } from '@/lib/api/contactLeads.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ContactLeadsTable } from '@/components/contactLeads/ContactLeadsTable';

export default async function ContactLeadsPage() {
  const token = await getServerToken();
  const leads = await getContactLeads(token);

  return (
    <div>
      <SectionHeading title="Contact leads" description={`${leads.length} leads`} />
      <ContactLeadsTable leads={leads} />
    </div>
  );
}
