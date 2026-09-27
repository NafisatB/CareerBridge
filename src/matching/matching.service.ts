import {BadRequestException,Injectable,NotFoundException} from '@nestjs/common';

import {MentorApplicationStatus,UserStatus} from 'generated/prisma/client';

import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: DatabaseService) {}

  async findMentorMatches(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        profileSkills: {
          select: {
            skillId: true,
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        careerInterests: {
          select: {
            careerInterestId: true,
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
      throw new NotFoundException('Student profile not found.');
    }

    if (
      profile.profileSkills.length === 0 &&
      profile.careerInterests.length === 0
    ) {
      throw new BadRequestException(
        'Add at least one skill or career interest before requesting mentor matches.',
      );
    }

    const mentors = await this.prisma.mentorProfile.findMany({
      where: {
        applicationStatus: MentorApplicationStatus.APPROVED,
        isAvailable: true,
        user: {
          status: UserStatus.ACTIVE,
        },
      },
      select: {
        id: true,
        professionalTitle: true,
        organisation: true,
        yearsOfExperience: true,
        bio: true,
        mentorSkills: {
          select: {
            skillId: true,
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        mentorInterests: {
          select: {
            careerInterestId: true,
            careerInterest: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const studentSkillIds = new Set(
      profile.profileSkills.map((item) => item.skillId),
    );

    const studentInterestIds = new Set(
      profile.careerInterests.map((item) => item.careerInterestId),
    );

    const matches = mentors
      .map((mentor) => {
        const matchedSkills = mentor.mentorSkills
          .filter((item) => studentSkillIds.has(item.skillId))
          .map((item) => item.skill);

        const matchedInterests = mentor.mentorInterests
          .filter((item) => studentInterestIds.has(item.careerInterestId))
          .map((item) => item.careerInterest);

        const skillScore =
          profile.profileSkills.length > 0
            ? (matchedSkills.length / profile.profileSkills.length) * 60
            : 0;

        const interestScore =
          profile.careerInterests.length > 0
            ? (matchedInterests.length /
                profile.careerInterests.length) *
              40
            : 0;

        const matchScore = Number(
          (skillScore + interestScore).toFixed(2),
        );

        return {
          mentor: {
            id: mentor.user.id,
            firstName: mentor.user.firstName,
            lastName: mentor.user.lastName,
            professionalTitle: mentor.professionalTitle,
            organisation: mentor.organisation,
            yearsOfExperience: mentor.yearsOfExperience,
            bio: mentor.bio,
            skills: mentor.mentorSkills.map((item) => item.skill),
            careerInterests: mentor.mentorInterests.map(
              (item) => item.careerInterest,
            ),
          },
          matchScore,
          matchedSkills,
          matchedInterests,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return {
      matches,
      total: matches.length,
    };
  }
}