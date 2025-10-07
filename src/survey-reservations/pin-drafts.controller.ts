import { Body, Controller, Post } from '@nestjs/common';
import { CreatePinDraftDto } from './dto/create-pin-draft.dto';
import { PinDraftsService } from './pin-drafts.service';

@Controller('pin-drafts')
export class PinDraftsController {
  constructor(private readonly service: PinDraftsService) {}

  /** 임시핀 등록 */
  @Post()
  async create(@Body() dto: CreatePinDraftDto) {
    const data = await this.service.create(dto);
    return { message: '임시핀 생성', data };
  }
}
