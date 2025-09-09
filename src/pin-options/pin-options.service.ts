import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PinOption } from './entities/pin-option.entity';
import { CreatePinOptionsDto } from './dto/create-pin-option.dto';

@Injectable()
export class PinOptionsService {
  constructor(
    @InjectRepository(PinOption)
    private readonly pinOptionRepository: Repository<PinOption>,
  ) {}

  /** 핀 기준 1:1 업서트 (외부 트랜잭션 사용) */
  async upsertWithManager(
    manager: EntityManager,
    pinId: string,
    dto: CreatePinOptionsDto,
  ): Promise<void> {
    const pinOptionRepo = manager.getRepository(PinOption);
    const exist = await pinOptionRepo.findOne({ where: { pinId } });

    const next = pinOptionRepo.create({
      ...(exist ?? { pinId }),
      hasAircon: dto.hasAircon ?? null,
      hasFridge: dto.hasFridge ?? null,
      hasWasher: dto.hasWasher ?? null,
      hasDryer: dto.hasDryer ?? null,
      hasBidet: dto.hasBidet ?? null,
      hasAirPurifier: dto.hasAirPurifier ?? null,
      isDirectLease: dto.isDirectLease ?? null,
      extraOptionsText: dto.extraOptionsText ?? null,
    });

    await pinOptionRepo.save(next);
  }

  async deleteByPinWithManager(
    manager: EntityManager,
    pinId: string,
  ): Promise<void> {
    await manager.getRepository(PinOption).delete({ pinId });
  }
}
