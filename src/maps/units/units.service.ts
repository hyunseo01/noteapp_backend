import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit) private readonly unitRepository: Repository<Unit>,
    private readonly dataSource: DataSource,
  ) {}

  async bulkCreateWithManager(
    manager: DataSource['manager'],
    pinId: string,
    items: CreateUnitDto[],
  ): Promise<void> {
    if (!items?.length) return;

    const unitRepo = manager.getRepository(Unit);
    const rows = items.map((d) =>
      unitRepo.create({
        pinId,
        rooms: d.rooms ?? null,
        baths: d.baths ?? null,
        hasLoft: d.hasLoft ?? null,
        hasTerrace: d.hasTerrace ?? null,
        salePrice: d.salePrice ?? null,
        note: d.note ?? null,
      }),
    );
    await unitRepo.save(rows);
  }

  async replaceForPinWithManager(
    manager: DataSource['manager'],
    pinId: string,
    items: CreateUnitDto[] = [],
  ): Promise<void> {
    const repo = manager.getRepository(Unit);
    await repo.delete({ pinId });
    if (!items.length) return;
    await repo.save(
      items.map((d) =>
        repo.create({
          pinId,
          rooms: d.rooms ?? 0,
          baths: d.baths ?? 0,
          hasLoft: d.hasLoft ?? false,
          hasTerrace: d.hasTerrace ?? false,
          salePrice: d.salePrice ?? 0,
          note: d.note ?? null,
        }),
      ),
    );
  }
}
