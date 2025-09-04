import { PartialType } from '@nestjs/swagger';
import { CreatePinOptionDto } from './create-pin-option.dto';

export class UpdatePinOptionDto extends PartialType(CreatePinOptionDto) {}
