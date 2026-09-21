export type ContactLeadSource = 'GENERAL' | 'CUSTOM_BRACELET';

export type ContactLeadInput = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  location?: string;
  source?: ContactLeadSource;
  message: string;
};

export type ContactLeadResponse = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  location: string | null;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED' | 'SPAM';
  source: ContactLeadSource;
  createdAt: string;
  updatedAt: string;
};
