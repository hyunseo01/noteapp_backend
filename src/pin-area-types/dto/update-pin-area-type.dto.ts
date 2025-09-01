import { PartialType } from '@nestjs/swagger';
import { CreatePinAreaTypeDto } from './create-pin-area-type.dto';

export class UpdatePinAreaTypeDto extends PartialType(CreatePinAreaTypeDto) {}
