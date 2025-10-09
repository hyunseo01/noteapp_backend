import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PinsService } from './pins.service';
import { CreatePinDto } from './dto/create-pin.dto';
import { UpdatePinDto } from './dto/update-pin.dto';
import { MapPinsDto } from './dto/map-pins.dto';
import { SearchPinsDto } from './dto/search-pins.dto';
import { UpdatePinDisableDto } from './dto/update-pin-disable.dto';

@Controller('pins')
export class PinsController {
  constructor(private readonly pinsService: PinsService) {}

  @Post()
  async create(@Body() dto: CreatePinDto) {
    const data = await this.pinsService.create(dto);
    return { message: '핀 생성됨', data };
  }

  @Get('search')
  async search(@Query() dto: SearchPinsDto) {
    const data = await this.pinsService.searchPins(dto);
    return { data };
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

  @Patch('disable/:id')
  async setDisabled(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePinDisableDto,
  ) {
    const data = await this.pinsService.setDisabled(id, dto.isDisabled);
    return { message: '핀 활성 상태 변경', data };
  }
}
