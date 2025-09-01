import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PinsService } from './pins.service';
import { CreatePinDto } from './dto/create-pin.dto';
import { UpdatePinDto } from './dto/update-pin.dto';

@Controller('pins')
export class PinsController {
  constructor(private readonly pinsService: PinsService) {}

  @Post()
  create(@Body() createPinDto: CreatePinDto) {
    return this.pinsService.create(createPinDto);
  }

  @Get()
  findAll() {
    return this.pinsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pinsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePinDto: UpdatePinDto) {
    return this.pinsService.update(+id, updatePinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pinsService.remove(+id);
  }
}
