import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';


const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined.');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const REQUIRED_ENV_VARS = [
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_FIRST_NAME',
  'ADMIN_LAST_NAME',
] as const;

function validateEnvironment(): void {
  const missing = REQUIRED_ENV_VARS.filter(
    (variable) => !process.env[variable],
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required seed environment variables: ${missing.join(', ')}`,
    );
  }

  const password = process.env.ADMIN_PASSWORD!;

  if (password.length < 12) {
    throw new Error(
      'ADMIN_PASSWORD must contain at least 12 characters.',
    );
  }
}

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD!;
  const firstName = process.env.ADMIN_FIRST_NAME!.trim();
  const lastName = process.env.ADMIN_LAST_NAME!.trim();

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
    },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== 'ADMIN') {
      throw new Error(
        `admin email "${email}" already belongs to a non-admin user.`,
      );
    }

    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        firstName,
        lastName,
        status: 'ACTIVE',
        password: passwordHash,
      },
    });

    console.log(`Admin account updated: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      firstName,
      lastName,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`Admin account created: ${email}`);
}

async function seedSkills(): Promise<void> {
  const skills = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    'SQL',
    'Data Analysis',
    'UI/UX Design',
    'Product Management',
    'Digital Marketing',
    'Communication',
    'Leadership',
    'Project Management',
    'Research',
  ];

  await prisma.skill.createMany({
    data: skills.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log(`Skills seeded: ${skills.length}`);
}

async function seedCareerInterests(): Promise<void> {
  const interests = [
    'Software Development',
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'Product Management',
    'UI/UX Design',
    'Digital Marketing',
    'Research and Academia',
    'Entrepreneurship',
    'Finance and Banking',
  ];

  await prisma.careerInterest.createMany({
    data: interests.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log(`Career interests seeded: ${interests.length}`);
}

async function seedCareerPathways(): Promise<void> {
  const pathways = [
    {
      name: 'Frontend Development',
      description:
        'A career pathway focused on building responsive and accessible user interfaces for web applications.',
    },
    {
      name: 'Backend Development',
      description:
        'A career pathway focused on server-side applications, APIs, databases, authentication, and backend systems.',
    },
    {
      name: 'Data Analysis',
      description:
        'A career pathway focused on collecting, cleaning, analysing, and communicating insights from data.',
    },
    {
      name: 'Data Science',
      description:
        'A career pathway combining statistics, programming, and machine learning to solve data-driven problems.',
    },
    {
      name: 'UI/UX Design',
      description:
        'A career pathway focused on user research, interaction design, visual design, and usability.',
    },
    {
      name: 'Product Management',
      description:
        'A career pathway focused on product strategy, user needs, prioritisation, delivery, and product growth.',
    },
    {
      name: 'Cybersecurity',
      description:
        'A career pathway focused on protecting applications, systems, networks, and data from security threats.',
    },
    {
      name: 'Digital Marketing',
      description:
        'A career pathway focused on digital campaigns, content, audience engagement, analytics, and growth.',
    },
  ];

  for (const pathway of pathways) {
    await prisma.careerPathway.upsert({
      where: {
        name: pathway.name,
      },
      update: {
        description: pathway.description,
        isActive: true,
      },
      create: pathway,
    });
  }

  console.log(`Career pathways seeded: ${pathways.length}`);
}

async function seed(): Promise<void> {
  validateEnvironment();

  console.log('Starting CareerBridge database seed...');

  await prisma.$transaction(async () => {
    await seedAdmin();
    await seedSkills();
    await seedCareerInterests();
    await seedCareerPathways();
  });

  console.log('CareerBridge database seed completed successfully.');
}

async function main(): Promise<void> {
  try {
    await seed();
  } catch (error) {
    console.error('CareerBridge database seed failed.');

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();