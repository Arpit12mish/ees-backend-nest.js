import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactLeadSource } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactLeadDto } from './dto/create-contact-lead.dto';
import { UpdateContactLeadStatusDto } from './dto/update-contact-lead-status.dto';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SOURCE_LABEL: Record<ContactLeadSource, string> = {
  GENERAL: 'General enquiry',
  CUSTOM_BRACELET: 'Custom bracelet request',
};

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateContactLeadDto) {
    const lead = await this.prisma.contactLead.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        subject: dto.subject ?? null,
        location: dto.location ?? null,
        source: dto.source ?? ContactLeadSource.GENERAL,
        message: dto.message,
      },
    });

    this.notifyNewLead(lead).catch((error) =>
      this.logger.error('Failed to send contact lead notification', error),
    );

    return lead;
  }

  private async notifyNewLead(lead: {
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    location: string | null;
    source: ContactLeadSource;
    message: string;
  }) {
    const notifyEmail = this.config.get<string>('contactNotificationEmail');
    if (!notifyEmail) return;

    const sourceLabel = SOURCE_LABEL[lead.source] ?? lead.source;
    const subjectLine = `New ${sourceLabel.toLowerCase()} from ${lead.name}`;

    const textLines = [
      `Source: ${sourceLabel}`,
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      lead.phone ? `Phone: ${lead.phone}` : null,
      lead.subject ? `Subject: ${lead.subject}` : null,
      lead.location ? `Location: ${lead.location}` : null,
      '',
      'Message:',
      lead.message,
    ].filter((line): line is string => line !== null);

    const htmlRows = [
      ['Source', sourceLabel],
      ['Name', lead.name],
      ['Email', lead.email],
      ...(lead.phone ? [['Phone', lead.phone]] : []),
      ...(lead.subject ? [['Subject', lead.subject]] : []),
      ...(lead.location ? [['Location', lead.location]] : []),
    ]
      .map(
        ([label, value]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#6b6b6b;">${escapeHtml(
            label,
          )}</td><td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`,
      )
      .join('');

    const html = `
      <div style="font-family:sans-serif;color:#111111;">
        <h2 style="margin:0 0 12px;">${escapeHtml(subjectLine)}</h2>
        <table>${htmlRows}</table>
        <p style="margin-top:16px;white-space:pre-wrap;">${escapeHtml(lead.message)}</p>
      </div>
    `;

    await this.email.send({
      to: notifyEmail,
      subject: subjectLine,
      text: textLines.join('\n'),
      html,
      replyTo: lead.email,
    });
  }

  async findAll() {
    return this.prisma.contactLead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.contactLead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException({
        message: 'Contact lead not found',
        errorCode: 'CONTACT_LEAD_NOT_FOUND',
      });
    }
    return lead;
  }

  async updateStatus(id: string, dto: UpdateContactLeadStatusDto) {
    await this.findOne(id);
    return this.prisma.contactLead.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
