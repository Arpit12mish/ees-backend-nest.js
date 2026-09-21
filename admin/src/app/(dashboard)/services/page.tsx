import Link from 'next/link';
import { getServices } from '@/lib/api/services.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleGate } from '@/components/common/RoleGate';
import { ServicesTable } from '@/components/services/ServicesTable';
import { deleteServiceAction } from './actions';

export default async function ServicesPage() {
  const token = await getServerToken();
  const services = await getServices(token);

  return (
    <div>
      <SectionHeading
        title="Services"
        description={`${services.length} services`}
        action={
          <RoleGate permission="services.write">
            <Link
              href="/services/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New service
            </Link>
          </RoleGate>
        }
      />

      <ServicesTable services={services} deleteAction={deleteServiceAction} />
    </div>
  );
}
