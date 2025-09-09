import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PinsService } from './pins.service';
import { CreatePinDto } from './dto/create-pin.dto';
import { UpdatePinDto } from './dto/update-pin.dto';
import { MapPinsDto } from './dto/map-pins.dto';

@Controller('pins')
export class PinsController {
  constructor(private readonly pinsService: PinsService) {}

  @Get('map')
  async getMapPins(@Query() dto: MapPinsDto) {
    const data = await this.pinsService.getMapPins(dto);
    return { data };
  }

  @Post()
  async create(@Body() dto: CreatePinDto) {
    const data = await this.pinsService.create(dto);
    return { success: true, message: '핀 생성됨', data };
  }
}
