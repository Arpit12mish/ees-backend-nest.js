import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactLeadDto } from './dto/create-contact-lead.dto';

@Controller('public/contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Post()
  async create(@Body() dto: CreateContactLeadDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Message received', data };
  }
}
