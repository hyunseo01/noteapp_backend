import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
  ) {}

  async create(dto: CreateTeamDto) {
    const nameDup = await this.teamRepository.findOne({
      where: { name: dto.name },
    });
    if (nameDup)
      throw new ConflictException(`팀 "${dto.name}"이(가) 이미 존재합니다.`);
    const codeDup = await this.teamRepository.findOne({
      where: { code: dto.code },
    });
    if (codeDup)
      throw new ConflictException(`팀 코드 "${dto.code}"가 이미 존재합니다.`);

    const ent = this.teamRepository.create({
      name: dto.name.trim(),
      code: dto.code.trim(),
      description: dto.description ?? null,
      is_active: dto.isActive ?? true,
    });
    const saved = await this.teamRepository.save(ent);
    return saved;
  }

  async list() {
    return this.teamRepository.find({ order: { id: 'DESC' } });
  }

  async get(id: string) {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) throw new NotFoundException('지정한 팀을 찾을 수 없습니다.');
    return team;
  }

  async update(id: string, dto: UpdateTeamDto) {
    const team = await this.get(id);

    if (dto.name && dto.name !== team.name) {
      const dup = await this.teamRepository.findOne({
        where: { name: dto.name },
      });
      if (dup)
        throw new ConflictException(`팀 "${dto.name}"이(가) 이미 존재합니다.`);
    }
    if (dto.code && dto.code !== team.code) {
      const dup = await this.teamRepository.findOne({
        where: { code: dto.code },
      });
      if (dup)
        throw new ConflictException(`팀 코드 "${dto.code}"가 이미 존재합니다.`);
    }

    Object.assign(team, {
      name: dto.name ?? team.name,
      code: dto.code ?? team.code,
      description: dto.description ?? team.description,
      is_active: dto.isActive ?? team.is_active,
    });

    await this.teamRepository.save(team);
    return team;
  }

  async remove(id: string) {
    const team = await this.get(id);
    await this.teamRepository.remove(team);
    return { id };
  }
}
