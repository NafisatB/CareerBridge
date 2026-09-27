import { Controller, Get } from '@nestjs/common';
import {ApiOperation,ApiResponse,ApiTags} from '@nestjs/swagger';
import { CareerInterestsService } from './career-interest.service';

@ApiTags('Career Interests')
@Controller('v1/career-interests')
export class CareerInterestsController {
  constructor(
    private readonly careerInterestsService: CareerInterestsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get available career interests',
    description:
      'Returns the career interests available for profile selection.',
  })
  @ApiResponse({
    status: 200,
    description: 'Career interests retrieved successfully.',
  })
  findAll() {
    return this.careerInterestsService.findAll();
  }
}