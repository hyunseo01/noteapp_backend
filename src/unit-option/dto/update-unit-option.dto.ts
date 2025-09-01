import { PartialType } from '@nestjs/swagger';
import { CreateUnitOptionDto } from './create-unit-option.dto';

export class UpdateUnitOptionDto extends PartialType(CreateUnitOptionDto) {}
