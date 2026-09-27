import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CareerInterestsService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll() {
    const careerInterests = await this.prisma.careerInterest.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      careerInterests,
    };
  }
}