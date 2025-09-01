import { Injectable } from '@nestjs/common';
import { CreatePinAreaTypeDto } from './dto/create-pin-area-type.dto';
import { UpdatePinAreaTypeDto } from './dto/update-pin-area-type.dto';

@Injectable()
export class PinAreaTypesService {
  create(createPinAreaTypeDto: CreatePinAreaTypeDto) {
    return 'This action adds a new pinAreaType';
  }

  findAll() {
    return `This action returns all pinAreaTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pinAreaType`;
  }

  update(id: number, updatePinAreaTypeDto: UpdatePinAreaTypeDto) {
    return `This action updates a #${id} pinAreaType`;
  }

  remove(id: number) {
    return `This action removes a #${id} pinAreaType`;
  }
}
