import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnitOptionService } from './unit-option.service';
import { CreateUnitOptionDto } from './dto/create-unit-option.dto';
import { UpdateUnitOptionDto } from './dto/update-unit-option.dto';

@Controller('unit-option')
export class UnitOptionController {
  constructor(private readonly unitOptionService: UnitOptionService) {}

  @Post()
  create(@Body() createUnitOptionDto: CreateUnitOptionDto) {
    return this.unitOptionService.create(createUnitOptionDto);
  }

  @Get()
  findAll() {
    return this.unitOptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitOptionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnitOptionDto: UpdateUnitOptionDto) {
    return this.unitOptionService.update(+id, updateUnitOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitOptionService.remove(+id);
  }
}
