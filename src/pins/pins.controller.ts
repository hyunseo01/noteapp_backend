import { Controller, Get, Query } from '@nestjs/common';
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
    return { success: true, data };
  }
}
