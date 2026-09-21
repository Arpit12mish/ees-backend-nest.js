export type ContactLeadStatus = 'NEW' | 'CONTACTED' | 'CLOSED' | 'SPAM';
export type ContactLeadSource = 'GENERAL' | 'CUSTOM_BRACELET';

export type ContactLead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  location?: string | null;
  message: string;
  status: ContactLeadStatus;
  source: ContactLeadSource;
  createdAt: string;
  updatedAt: string;
};
