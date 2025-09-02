import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PinAreaTypesService } from './pin-area-types.service';
import { CreatePinAreaTypeDto } from './dto/create-pin-area-type.dto';
import { UpdatePinAreaTypeDto } from './dto/update-pin-area-type.dto';

@Controller('pin-area-types')
export class PinAreaTypesController {
  constructor(private readonly pinAreaTypesService: PinAreaTypesService) {}

  @Post()
  create(@Body() createPinAreaTypeDto: CreatePinAreaTypeDto) {
    return this.pinAreaTypesService.create(createPinAreaTypeDto);
  }

  @Get()
  findAll() {
    return this.pinAreaTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pinAreaTypesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePinAreaTypeDto: UpdatePinAreaTypeDto,
  ) {
    return this.pinAreaTypesService.update(+id, updatePinAreaTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pinAreaTypesService.remove(+id);
  }
}
