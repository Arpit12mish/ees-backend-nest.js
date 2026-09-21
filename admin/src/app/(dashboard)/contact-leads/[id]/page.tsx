import { notFound } from 'next/navigation';
import { getContactLead } from '@/lib/api/contactLeads.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ContactLeadStatusControl } from '@/components/contactLeads/ContactLeadStatusControl';

export default async function ContactLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const lead = await getContactLead(id, token).catch(() => null);
  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <SectionHeading title={lead.name} eyebrow="Contact lead" />

      <div className="max-w-xl space-y-3 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <p className="text-sm"><span className="font-semibold text-[var(--heading)]">Email:</span> {lead.email}</p>
        {lead.phone ? <p className="text-sm"><span className="font-semibold text-[var(--heading)]">Phone:</span> {lead.phone}</p> : null}
        {lead.subject ? <p className="text-sm"><span className="font-semibold text-[var(--heading)]">Subject:</span> {lead.subject}</p> : null}
        {lead.location ? <p className="text-sm"><span className="font-semibold text-[var(--heading)]">Location:</span> {lead.location}</p> : null}
        <p className="text-sm"><span className="font-semibold text-[var(--heading)]">Source:</span> {lead.source === 'CUSTOM_BRACELET' ? 'Custom Bracelet' : 'General'}</p>
        <p className="text-sm text-[var(--muted)]">
          Received {new Date(lead.createdAt).toLocaleString()}
        </p>
        <div>
          <p className="text-sm font-semibold text-[var(--heading)]">Message</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted)]">{lead.message}</p>
        </div>
      </div>

      <div className="max-w-xl rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <h3 className="font-semibold text-[var(--heading)]">Status</h3>
        <div className="mt-3">
          <ContactLeadStatusControl lead={lead} />
        </div>
      </div>
    </div>
  );
}
