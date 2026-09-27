import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { MentorApplicationStatus } from 'generated/prisma/enums';
import { DatabaseService } from 'src/database/database.service';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: DatabaseService) {}

  async findApplications() {
    const mentors = await this.prisma.mentorProfile.findMany({
      select: {
        id: true,
        applicationStatus: true,
        professionalTitle: true,
        organisation: true,
        yearsOfExperience: true,
        bio: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      mentors,
      total: mentors.length,
    };
  }

  async updateApplicationStatus(
  mentorProfileId: string,
  status: MentorApplicationStatus,
) {
  const mentor = await this.prisma.mentorProfile.findUnique({
    where: { id: mentorProfileId },
    select: {
      id: true,
      applicationStatus: true,
    },
  });

  if (!mentor) {
    throw new NotFoundException('Mentor application not found.');
  }

  if (mentor.applicationStatus !== MentorApplicationStatus.PENDING) {
    throw new BadRequestException(
      'This mentor application has already been reviewed.',
    );
  }

  const updatedMentor = await this.prisma.mentorProfile.update({
    where: { id: mentorProfileId },
    data: {
      applicationStatus: status,
      isAvailable: status === MentorApplicationStatus.APPROVED,
    },
    select: {
      id: true,
      applicationStatus: true,
      professionalTitle: true,
      organisation: true,
      yearsOfExperience: true,
      bio: true,
      isAvailable: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      },
    },
  });

  return {
    mentor: updatedMentor,
  };
}

async getMyProfile(userId: string) {
  const mentorProfile = await this.prisma.mentorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      applicationStatus: true,
      professionalTitle: true,
      organisation: true,
      yearsOfExperience: true,
      bio: true,
      isAvailable: true,
      mentorSkills: {
        select: {
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

  if (!mentorProfile) {
    throw new NotFoundException('Mentor profile not found.');
  }

  return {
    mentorProfile,
  };
}

async updateMyProfile(
  userId: string,
  updateMentorProfileDto: UpdateMentorProfileDto,
) {
  const mentorProfile = await this.prisma.mentorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
    },
  });

  if (!mentorProfile) {
    throw new NotFoundException('Mentor profile not found.');
  }

  const {
    skillIds,
    careerInterestIds,
    professionalTitle,
    organisation,
    yearsOfExperience,
    bio,
  } = updateMentorProfileDto;

  if (skillIds !== undefined) {
    const skills = await this.prisma.skill.findMany({
      where: {
        id: {
          in: skillIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (skills.length !== skillIds.length) {
      throw new BadRequestException(
        'One or more selected skills do not exist.',
      );
    }
  }

  if (careerInterestIds !== undefined) {
    const careerInterests =
      await this.prisma.careerInterest.findMany({
        where: {
          id: {
            in: careerInterestIds,
          },
        },
        select: {
          id: true,
        },
      });

    if (careerInterests.length !== careerInterestIds.length) {
      throw new BadRequestException(
        'One or more selected career interests do not exist.',
      );
    }
  }

  await this.prisma.$transaction(async (tx) => {
    const profileData: Record<string, unknown> = {};

    if (professionalTitle !== undefined) {
      profileData.professionalTitle = professionalTitle;
    }

    if (organisation !== undefined) {
      profileData.organisation = organisation;
    }

    if (yearsOfExperience !== undefined) {
      profileData.yearsOfExperience = yearsOfExperience;
    }

    if (bio !== undefined) {
      profileData.bio = bio;
    }

    if (Object.keys(profileData).length > 0) {
      await tx.mentorProfile.update({
        where: {
          id: mentorProfile.id,
        },
        data: profileData,
      });
    }

    if (skillIds !== undefined) {
      await tx.mentorSkill.deleteMany({
        where: {
          mentorProfileId: mentorProfile.id,
        },
      });

      if (skillIds.length > 0) {
        await tx.mentorSkill.createMany({
          data: skillIds.map((skillId) => ({
            mentorProfileId: mentorProfile.id,
            skillId,
          })),
        });
      }
    }

    if (careerInterestIds !== undefined) {
      await tx.mentorCareerInterest.deleteMany({
        where: {
          mentorProfileId: mentorProfile.id,
        },
      });

      if (careerInterestIds.length > 0) {
        await tx.mentorCareerInterest.createMany({
          data: careerInterestIds.map((careerInterestId) => ({
            mentorProfileId: mentorProfile.id,
            careerInterestId,
          })),
        });
      }
    }
  });

  return this.getMyProfile(userId);
}

async updateMyAvailability(
  userId: string,
  isAvailable: boolean,
) {
  const mentorProfile = await this.prisma.mentorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      applicationStatus: true,
    },
  });

  if (!mentorProfile) {
    throw new NotFoundException('Mentor profile not found.');
  }

  if (
    mentorProfile.applicationStatus !==
    MentorApplicationStatus.APPROVED
  ) {
    throw new BadRequestException(
      'Only approved mentors can change their availability.',
    );
  }

  const updatedMentor = await this.prisma.mentorProfile.update({
    where: {
      id: mentorProfile.id,
    },
    data: {
      isAvailable,
    },
    select: {
      id: true,
      applicationStatus: true,
      isAvailable: true,
    },
  });

  return {
    mentor: updatedMentor,
  };
}

async findAvailableMentors() {
  const mentors = await this.prisma.mentorProfile.findMany({
    where: {
      applicationStatus: MentorApplicationStatus.APPROVED,
      isAvailable: true,
      user: {
        status: 'ACTIVE',
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
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    mentors,
    total: mentors.length,
  };
}
}