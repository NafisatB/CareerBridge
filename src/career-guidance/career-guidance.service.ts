import {BadRequestException,Injectable,NotFoundException} from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';
import { MatchingService } from 'src/matching/matching.service';

@Injectable()
export class CareerGuidanceService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly matchingService: MatchingService,
  ) {}

  async getMyCareerGuidance(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        fieldOfStudy: true,
        graduationStatus: true,
        graduationYear: true,
        careerInterests: {
          select: {
            careerInterest: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }

    if (profile.careerInterests.length === 0) {
      throw new BadRequestException(
        'Add at least one career interest before viewing career guidance.',
      );
    }

    const careerInterestIds = profile.careerInterests.map(
      ({ careerInterest }) => careerInterest.id,
    );

    const pathways = await this.prisma.careerPathway.findMany({
      where: {
        isActive: true,
        interests: {
          some: {
            careerInterestId: {
              in: careerInterestIds,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        interests: {
          where: {
            careerInterestId: {
              in: careerInterestIds,
            },
          },
          select: {
            careerInterest: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const matches = await this.matchingService.findMentorMatches(userId);

    return {
      profile: {
        status: profile.status,
        fieldOfStudy: profile.fieldOfStudy,
        graduationStatus: profile.graduationStatus,
        graduationYear: profile.graduationYear,
        careerInterests: profile.careerInterests.map(
          ({ careerInterest }) => careerInterest,
        ),
      },
      pathways: pathways.map((pathway) => ({
        id: pathway.id,
        name: pathway.name,
        description: pathway.description,
        matchedInterests: pathway.interests.map(
          ({ careerInterest }) => careerInterest,
        ),
      })),
      mentors: matches.matches,
    };
  }
}