import {ConflictException,Injectable,NotFoundException} from '@nestjs/common';

import {MentorApplicationStatus,MentorRequestStatus,UserRole,UserStatus} from 'generated/prisma/client';

import { DatabaseService } from 'src/database/database.service';
import { CreateMentorRequestDto } from './dto/mentor-request.dto';


@Injectable()
export class MentorRequestsService {
  constructor(private readonly prisma: DatabaseService) {}

  async createRequest(
    studentId: string,
    createMentorRequestDto: CreateMentorRequestDto,
  ) {
    const { mentorId, message } = createMentorRequestDto;

    const mentor = await this.prisma.user.findUnique({
      where: {
        id: mentorId,
      },
      select: {
        id: true,
        role: true,
        status: true,
        mentorProfile: {
          select: {
            id: true,
            applicationStatus: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!mentor || mentor.role !== UserRole.MENTOR) {
      throw new NotFoundException('Mentor not found.');
    }

    if (mentor.status !== UserStatus.ACTIVE) {
      throw new ConflictException('This mentor account is not active.');
    }

    if (!mentor.mentorProfile) {
      throw new NotFoundException('Mentor profile not found.');
    }

    if (
      mentor.mentorProfile.applicationStatus !==
      MentorApplicationStatus.APPROVED
    ) {
      throw new ConflictException(
        'This mentor has not been approved yet.',
      );
    }

    if (!mentor.mentorProfile.isAvailable) {
      throw new ConflictException(
        'This mentor is currently unavailable.',
      );
    }

    const existingRequest = await this.prisma.mentorRequest.findFirst({
      where: {
        studentId,
        mentorId,
        status: MentorRequestStatus.PENDING,
      },
      select: {
        id: true,
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'You already have a pending request with this mentor.',
      );
    }

    return this.prisma.mentorRequest.create({
      data: {
        studentId,
        mentorId,
        message,
      },
      select: {
        id: true,
        studentId: true,
        mentorId: true,
        status: true,
        message: true,
        requestedAt: true,
        respondedAt: true,
        completedAt: true,
      },
    });
  }

  async findMyRequests(studentId: string) {
  const requests = await this.prisma.mentorRequest.findMany({
    where: {
      studentId,
    },
    select: {
      id: true,
      mentorId: true,
      status: true,
      message: true,
      requestedAt: true,
      respondedAt: true,
      completedAt: true,
      mentor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mentorProfile: {
            select: {
              professionalTitle: true,
              organisation: true,
              yearsOfExperience: true,
            },
          },
        },
      },
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });

  return {
    requests,
    total: requests.length,
  };
}

async findReceivedRequests(mentorId: string) {
  const requests = await this.prisma.mentorRequest.findMany({
    where: {
      mentorId,
    },
    select: {
      id: true,
      studentId: true,
      status: true,
      message: true,
      requestedAt: true,
      respondedAt: true,
      completedAt: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profile: {
            select: {
              fieldOfStudy: true,
              graduationStatus: true,
              graduationYear: true,
            },
          },
        },
      },
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });

  return {
    requests,
    total: requests.length,
  };
}

async respondToRequest(
  mentorId: string,
  requestId: string,
  status: MentorRequestStatus,
) {
  if (
    status !== MentorRequestStatus.ACCEPTED &&
    status !== MentorRequestStatus.DECLINED
  ) {
    throw new ConflictException(
      'A mentor request can only be accepted or rejected.',
    );
  }

  const request = await this.prisma.mentorRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      mentorId: true,
      status: true,
      respondedAt: true,
    },
  });

  if (!request) {
    throw new NotFoundException('Mentor request not found.');
  }

  if (request.mentorId !== mentorId) {
    throw new ConflictException(
      'You are not authorized to respond to this mentor request.',
    );
  }

  if (request.status !== MentorRequestStatus.PENDING) {
    throw new ConflictException(
      'This mentor request has already been responded to.',
    );
  }

  return this.prisma.mentorRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status,
      respondedAt: new Date(),
    },
    select: {
      id: true,
      studentId: true,
      mentorId: true,
      status: true,
      message: true,
      requestedAt: true,
      respondedAt: true,
      completedAt: true,
    },
  });
}

async cancelRequest(studentId: string, requestId: string) {
  const request = await this.prisma.mentorRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      studentId: true,
      status: true,
    },
  });

  if (!request) {
    throw new NotFoundException('Mentor request not found.');
  }

  if (request.studentId !== studentId) {
    throw new ConflictException(
      'You are not authorized to cancel this mentor request.',
    );
  }

  if (request.status !== MentorRequestStatus.PENDING) {
    throw new ConflictException(
      'Only pending mentor requests can be cancelled.',
    );
  }

  return this.prisma.mentorRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: MentorRequestStatus.CANCELLED,
    },
    select: {
      id: true,
      studentId: true,
      mentorId: true,
      status: true,
      message: true,
      requestedAt: true,
      respondedAt: true,
      completedAt: true,
    },
  });
}

async completeRequest(mentorId: string, requestId: string) {
  const request = await this.prisma.mentorRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      mentorId: true,
      status: true,
    },
  });

  if (!request) {
    throw new NotFoundException('Mentor request not found.');
  }

  if (request.mentorId !== mentorId) {
    throw new ConflictException(
      'You are not authorized to complete this mentor request.',
    );
  }

  if (request.status !== MentorRequestStatus.ACCEPTED) {
    throw new ConflictException(
      'Only accepted mentor requests can be completed.',
    );
  }

  return this.prisma.mentorRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: MentorRequestStatus.COMPLETED,
      completedAt: new Date(),
    },
    select: {
      id: true,
      studentId: true,
      mentorId: true,
      status: true,
      message: true,
      requestedAt: true,
      respondedAt: true,
      completedAt: true,
    },
  });
}
}