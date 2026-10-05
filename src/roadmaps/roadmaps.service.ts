import {ConflictException,Injectable,NotFoundException} from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';

import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { RoadmapTaskStatus } from 'generated/prisma/enums';
import { UpdateRoadmapTaskDto } from './dto/update-roadmap-task.dto';

@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: DatabaseService) {}

  async createRoadmap(
    userId: string,
    createRoadmapDto: CreateRoadmapDto,
  ) {
    const { pathwayId } = createRoadmapDto;

    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
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

    const pathway = await this.prisma.careerPathway.findUnique({
      where: {
        id: pathwayId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        interests: {
          select: {
            careerInterestId: true,
          },
        },
      },
    });

    if (!pathway) {
      throw new NotFoundException('Career pathway not found.');
    }

    if (!pathway.isActive) {
      throw new ConflictException(
        'This career pathway is no longer active.',
      );
    }

    const studentInterestIds = new Set(
      profile.careerInterests.map(
        ({ careerInterestId }) => careerInterestId,
      ),
    );

    const pathwayMatchesInterest = pathway.interests.some(
      ({ careerInterestId }) =>
        studentInterestIds.has(careerInterestId),
    );

    if (!pathwayMatchesInterest) {
      throw new ConflictException(
        'This career pathway does not match your career interests.',
      );
    }

    const existingRoadmap = await this.prisma.roadmap.findUnique({
      where: {
        profileId_pathwayId: {
          profileId: profile.id,
          pathwayId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingRoadmap) {
      throw new ConflictException(
        'You already have a roadmap for this career pathway.',
      );
    }

    return this.prisma.roadmap.create({
      data: {
        profileId: profile.id,
        pathwayId: pathway.id,
        tasks: {
          create: this.getInitialTasks(pathway.name),
        },
      },
      select: {
        id: true,
        pathwayId: true,
        createdAt: true,
        updatedAt: true,
        pathway: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            status: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  private getInitialTasks(pathwayName: string) {
    return [
      {
        title: 'Define your target career role',
        description: `Research the ${pathwayName} pathway and identify a specific role you want to pursue.`,
        order: 1,
      },
      {
        title: 'Identify required skills',
        description:
          'Identify the technical and professional skills required for your target role.',
        order: 2,
      },
      {
        title: 'Build a practical project',
        description:
          'Complete a practical project that demonstrates relevant skills for your target career.',
        order: 3,
      },
      {
        title: 'Build your professional profile',
        description:
          'Update your CV, LinkedIn profile, portfolio, or other relevant professional materials.',
        order: 4,
      },
      {
        title: 'Prepare for opportunities',
        description:
          'Prepare for interviews, applications, networking, and other opportunities related to your target role.',
        order: 5,
      },
    ];
  }

  async getMyRoadmaps(userId: string) {
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

  const roadmaps = await this.prisma.roadmap.findMany({
    where: {
      profileId: profile.id,
    },
    select: {
      id: true,
      pathwayId: true,
      createdAt: true,
      updatedAt: true,
      pathway: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          status: true,
          completedAt: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const roadmapsWithProgress = roadmaps.map((roadmap) => {
    const totalTasks = roadmap.tasks.length;

    const completedTasks = roadmap.tasks.filter(
      (task) => task.status === RoadmapTaskStatus.COMPLETED,
    ).length;

    const inProgressTasks = roadmap.tasks.filter(
      (task) => task.status === RoadmapTaskStatus.IN_PROGRESS,
    ).length;

    const pendingTasks = roadmap.tasks.filter(
      (task) => task.status === RoadmapTaskStatus.PENDING,
    ).length;

    const completionPercentage =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

        return {
      ...roadmap,
      progress: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionPercentage,
      },
    };
  });

  return {
    roadmaps: roadmapsWithProgress,
    total: roadmapsWithProgress.length,
  };
}

async updateRoadmapTask(
  userId: string,
  taskId: string,
  updateRoadmapTaskDto: UpdateRoadmapTaskDto,
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

  const task = await this.prisma.roadmapTask.findFirst({
    where: {
      id: taskId,
      roadmap: {
        profileId: profile.id,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!task) {
    throw new NotFoundException('Roadmap task not found.');
  }

  const newStatus = updateRoadmapTaskDto.status;

  if (
    task.status === RoadmapTaskStatus.COMPLETED &&
    newStatus !== RoadmapTaskStatus.COMPLETED
  ) {
    throw new ConflictException(
      'A completed roadmap task cannot be moved back to an earlier status.',
    );
  }

  const completedAt =
    newStatus === RoadmapTaskStatus.COMPLETED
      ? new Date()
      : null;

  const updatedTask = await this.prisma.roadmapTask.update({
    where: {
      id: task.id,
    },
    data: {
      status: newStatus,
      completedAt,
    },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      status: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    task: updatedTask,
  };
}
async deleteRoadmap(
  userId: string,
  roadmapId: string,
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
    throw new NotFoundException(
      'Profile not found.',
    );
  }

  const roadmap = await this.prisma.roadmap.findFirst({
    where: {
      id: roadmapId,
      profileId: profile.id,
    },
    select: {
      id: true,
    },
  });

  if (!roadmap) {
    throw new NotFoundException(
      'Roadmap not found.',
    );
  }

  await this.prisma.roadmap.delete({
    where: {
      id: roadmap.id,
    },
  });

  return {
    message: 'Roadmap deleted successfully.',
  };
}
}

