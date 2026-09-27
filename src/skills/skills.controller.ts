import { Controller, Get } from '@nestjs/common';
import {ApiOperation,ApiResponse,ApiTags} from '@nestjs/swagger';

import { SkillsService } from './skills.service';

@ApiTags('Skills')
@Controller('v1/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get available skills',
    description: 'Returns the skills available for profile selection.',
  })
  @ApiResponse({
    status: 200,
    description: 'Skills retrieved successfully.',
  })
  findAll() {
    return this.skillsService.findAll();
  }
}