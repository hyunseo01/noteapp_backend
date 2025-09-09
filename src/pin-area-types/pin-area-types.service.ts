import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PinAreaType } from './entities/pin-area-type.entity';
import { CreatePinAreaTypeDto } from './dto/create-pin-area-type.dto';

@Injectable()
export class PinAreaTypesService {
  constructor(
    @InjectRepository(PinAreaType)
    private pinAreaTypeRepository: Repository<PinAreaType>,
  ) {}

  /** 핀의 전용면적 리스트를 통째로 교체 */
  async replaceForPinWithManager(
    manager: EntityManager,
    pinId: string,
    items: CreatePinAreaTypeDto[] = [],
  ) {
    const pinAreaTypeRepo = manager.getRepository(PinAreaType);
    await pinAreaTypeRepo.delete({ pinId });
    if (!items.length) return;
    const rows = items.map((d) =>
      pinAreaTypeRepo.create({
        pinId,
        exclusiveArea: d.exclusiveArea.toString(), // decimal은 문자열로 저장
        label: d.label ?? null,
      }),
    );
    await pinAreaTypeRepo.save(rows);
  }
}
