import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PinOptionsService } from './pin-options.service';
import { CreatePinOptionDto } from './dto/create-pin-option.dto';
import { UpdatePinOptionDto } from './dto/update-pin-option.dto';

@Controller('pin-options')
export class PinOptionsController {
  constructor(private readonly pinOptionsService: PinOptionsService) {}

  @Post()
  create(@Body() createPinOptionDto: CreatePinOptionDto) {
    return this.pinOptionsService.create(createPinOptionDto);
  }

  @Get()
  findAll() {
    return this.pinOptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pinOptionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePinOptionDto: UpdatePinOptionDto) {
    return this.pinOptionsService.update(+id, updatePinOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pinOptionsService.remove(+id);
  }
}
