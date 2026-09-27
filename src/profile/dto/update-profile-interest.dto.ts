import { ApiProperty } from '@nestjs/swagger';
import {ArrayMaxSize,ArrayUnique,IsArray,IsUUID} from 'class-validator';

export class UpdateProfileInterestsDto {
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ],
    description: 'IDs of the skills selected by the user.',
    type: [String],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(20)
  skillIds: string[];

  @ApiProperty({
    example: [
      '7ba7b810-9dad-11d1-80b4-00c04fd430c8',
      '8ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ],
    description:
      'IDs of the career interests selected by the user.',
    type: [String],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  careerInterestIds: string[];
}