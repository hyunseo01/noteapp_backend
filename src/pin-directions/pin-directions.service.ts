import { Injectable } from '@nestjs/common';
import { CreatePinDirectionDto } from './dto/create-pin-direction.dto';
import { UpdatePinDirectionDto } from './dto/update-pin-direction.dto';

@Injectable()
export class PinDirectionsService {
  create(createPinDirectionDto: CreatePinDirectionDto) {
    return 'This action adds a new pinDirection';
  }

  findAll() {
    return `This action returns all pinDirections`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pinDirection`;
  }

  update(id: number, updatePinDirectionDto: UpdatePinDirectionDto) {
    return `This action updates a #${id} pinDirection`;
  }

  remove(id: number) {
    return `This action removes a #${id} pinDirection`;
  }
}
