import {BadRequestException, Injectable,NotFoundException} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateProfileInterestsDto } from './dto/update-profile-interest.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: DatabaseService,
  ) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        status: true,
        phoneNumber: true,
        gender: true,
        institutionName: true,
        fieldOfStudy: true,
        graduationStatus: true,
        graduationYear: true,
        bio: true,

         profileSkills: {
        select: {
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
          careerInterest: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found.',
      );
    }

    return {
      profile,
    };
  }

async updateMyProfile(
  userId: string,
  updateProfileDto: UpdateProfileDto,
) {
  const profile = await this.prisma.profile.findUnique({
    where: { userId },
    select: {
      id: true,
    },
  });

  if (!profile) {
    throw new NotFoundException('Profile not found.');
  }

  await this.prisma.profile.update({
    where: { id: profile.id },
    data: {
      ...(updateProfileDto.phoneNumber !== undefined && {
        phoneNumber: updateProfileDto.phoneNumber,
      }),
      ...(updateProfileDto.gender !== undefined && {
        gender: updateProfileDto.gender,
      }),
      ...(updateProfileDto.institutionName !== undefined && {
        institutionName: updateProfileDto.institutionName,
      }),
      ...(updateProfileDto.fieldOfStudy !== undefined && {
        fieldOfStudy: updateProfileDto.fieldOfStudy,
      }),
      ...(updateProfileDto.graduationStatus !== undefined && {
        graduationStatus: updateProfileDto.graduationStatus,
      }),
      ...(updateProfileDto.graduationYear !== undefined && {
        graduationYear: updateProfileDto.graduationYear,
      }),
      ...(updateProfileDto.bio !== undefined && {
        bio: updateProfileDto.bio,
      }),
    },
  });

  await this.updateProfileStatus(profile.id);

  return this.getMyProfile(userId);
}

async updateMyInterests(
  userId: string,
  updateProfileInterestsDto: UpdateProfileInterestsDto,
) {
  const profile = await this.prisma.profile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    throw new NotFoundException('Profile not found.');
  }

  const {
    skillIds,
    careerInterestIds,
  } = updateProfileInterestsDto;

  const [skills, careerInterests] =
    await this.prisma.$transaction([
      this.prisma.skill.findMany({
        where: {
          id: {
            in: skillIds,
          },
        },
        select: {
          id: true,
        },
      }),

      this.prisma.careerInterest.findMany({
        where: {
          id: {
            in: careerInterestIds,
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

  if (skills.length !== skillIds.length) {
    throw new BadRequestException(
      'One or more selected skills do not exist.',
    );
  }

  if (
    careerInterests.length !==
    careerInterestIds.length
  ) {
    throw new BadRequestException(
      'One or more selected career interests do not exist.',
    );
  }

  await this.prisma.$transaction(async (tx) => {
    await tx.profileSkill.deleteMany({
      where: {
        profileId: profile.id,
      },
    });

    await tx.profileCareerInterest.deleteMany({
      where: {
        profileId: profile.id,
      },
    });

    if (skillIds.length > 0) {
      await tx.profileSkill.createMany({
        data: skillIds.map((skillId) => ({
          profileId: profile.id,
          skillId,
        })),
      });
    }

    if (careerInterestIds.length > 0) {
      await tx.profileCareerInterest.createMany({
        data: careerInterestIds.map(
          (careerInterestId) => ({
            profileId: profile.id,
            careerInterestId,
          }),
        ),
      });
    }
  });

  await this.updateProfileStatus(profile.id);

  return this.getMyProfile(userId);
}

private async updateProfileStatus(profileId: string): Promise<void> {
  const profile = await this.prisma.profile.findUnique({
    where: { id: profileId },
    select: {
      phoneNumber: true,
      gender: true,
      institutionName: true,
      fieldOfStudy: true,
      graduationStatus: true,
      graduationYear: true,
      profileSkills: {
        select: {
          skillId: true,
        },
      },
      careerInterests: {
        select: {
          careerInterestId: true,
        },
      },
    },
  });

  if (!profile) {
    throw new NotFoundException('Profile not found.');
  }

  const isComplete =
    Boolean(profile.phoneNumber?.trim()) &&
    profile.gender !== null &&
    Boolean(profile.institutionName?.trim()) &&
    Boolean(profile.fieldOfStudy?.trim()) &&
    profile.graduationStatus !== null &&
    profile.graduationYear !== null &&
    profile.profileSkills.length > 0 &&
    profile.careerInterests.length > 0;

  await this.prisma.profile.update({
    where: { id: profileId },
    data: {
      status: isComplete ? 'COMPLETE' : 'INCOMPLETE',
    },
  });
}
}