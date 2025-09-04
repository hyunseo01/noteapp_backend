import { Injectable } from '@nestjs/common';
import { CreatePinOptionDto } from './dto/create-pin-option.dto';
import { UpdatePinOptionDto } from './dto/update-pin-option.dto';

@Injectable()
export class PinOptionsService {
  create(createPinOptionDto: CreatePinOptionDto) {
    return 'This action adds a new pinOption';
  }

  findAll() {
    return `This action returns all pinOptions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pinOption`;
  }

  update(id: number, updatePinOptionDto: UpdatePinOptionDto) {
    return `This action updates a #${id} pinOption`;
  }

  remove(id: number) {
    return `This action removes a #${id} pinOption`;
  }
}
