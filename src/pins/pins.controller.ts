import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PinsService } from './pins.service';
import { CreatePinDto } from './dto/create-pin.dto';
import { UpdatePinDto } from './dto/update-pin.dto';
import { MapPinsDto } from './dto/map-pins.dto';

@Controller('pins')
export class PinsController {
  constructor(private readonly pinsService: PinsService) {}

  @Post()
  async create(@Body() dto: CreatePinDto) {
    const data = await this.pinsService.create(dto);
    return { message: '핀 생성됨', data };
  }

  @Get('map')
  async getMapPins(@Query() dto: MapPinsDto) {
    const data = await this.pinsService.getMapPins(dto);
    return { data };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const pin = await this.pinsService.findDetail(id);
    return { data: pin };
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: UpdatePinDto) {
    const data = await this.pinsService.update(id, dto);
    return { message: '핀 수정됨', data };
  }
}
