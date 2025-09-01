import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PinDirectionsService } from './pin-directions.service';
import { CreatePinDirectionDto } from './dto/create-pin-direction.dto';
import { UpdatePinDirectionDto } from './dto/update-pin-direction.dto';

@Controller('pin-directions')
export class PinDirectionsController {
  constructor(private readonly pinDirectionsService: PinDirectionsService) {}

  @Post()
  create(@Body() createPinDirectionDto: CreatePinDirectionDto) {
    return this.pinDirectionsService.create(createPinDirectionDto);
  }

  @Get()
  findAll() {
    return this.pinDirectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pinDirectionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePinDirectionDto: UpdatePinDirectionDto) {
    return this.pinDirectionsService.update(+id, updatePinDirectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pinDirectionsService.remove(+id);
  }
}
