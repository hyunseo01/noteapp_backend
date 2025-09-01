import { Injectable } from '@nestjs/common';
import { CreateUnitOptionDto } from './dto/create-unit-option.dto';
import { UpdateUnitOptionDto } from './dto/update-unit-option.dto';

@Injectable()
export class UnitOptionService {
  create(createUnitOptionDto: CreateUnitOptionDto) {
    return 'This action adds a new unitOption';
  }

  findAll() {
    return `This action returns all unitOption`;
  }

  findOne(id: number) {
    return `This action returns a #${id} unitOption`;
  }

  update(id: number, updateUnitOptionDto: UpdateUnitOptionDto) {
    return `This action updates a #${id} unitOption`;
  }

  remove(id: number) {
    return `This action removes a #${id} unitOption`;
  }
}
