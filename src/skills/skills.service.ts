import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll() {
    const skills = await this.prisma.skill.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      skills,
    };
  }
}