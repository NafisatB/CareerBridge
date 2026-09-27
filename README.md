# CareerBridge Backend

A production-oriented NestJS backend for **CareerBridge**, a mentorship and career-guidance platform designed to help Nigerian university students and recent graduates transition from education into employment through structured career guidance, mentor matching, mentorship allocation, and career-roadmap tracking.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Problem Statement](#problem-statement)
* [Solution](#solution)
* [MVP Scope](#mvp-scope)
* [Core User Roles](#core-user-roles)
* [Core Workflow](#core-workflow)
* [Backend Architecture](#backend-architecture)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Authentication and Authorization](#authentication-and-authorization)
* [Database Domain](#database-domain)
* [API Overview](#api-overview)
* [Student/Graduate Workflow](#studentgraduate-workflow)
* [Mentor Workflow](#mentor-workflow)
* [Administrator Workflow](#administrator-workflow)
* [Matching Logic](#matching-logic)
* [Career Guidance](#career-guidance)
* [Roadmap and Progress Tracking](#roadmap-and-progress-tracking)
* [Validation and Error Handling](#validation-and-error-handling)
* [Security](#security)
* [Environment Configuration](#environment-configuration)
* [Local Development](#local-development)
* [Database Setup](#database-setup)
* [API Documentation](#api-documentation)
* [Testing Checklist](#testing-checklist)
* [Frontend Integration](#frontend-integration)
* [MVP Completion Status](#mvp-completion-status)
* [Future Enhancements](#future-enhancements)
* [Project Reflection](#project-reflection)

---

# Project Overview

CareerBridge is a web-based mentorship and career-guidance platform.

The backend provides the business logic and data services required for:

* user registration and authentication
* role-based access control
* student and graduate onboarding
* mentor applications and approval
* mentor profile management
* mentor availability
* mentor discovery
* skill and career-interest matching
* career pathway recommendations
* mentorship requests
* mentor request acceptance and rejection
* mentorship completion
* career roadmap generation
* roadmap task tracking
* roadmap progress calculation
* administrative user management

The backend is designed around a RESTful API and provides structured JSON responses for consumption by the frontend application.

---

# Problem Statement

Many university students and recent graduates struggle to transition from education into employment because they lack access to:

* structured career guidance
* experienced mentors
* professional networks
* information about relevant career pathways
* practical career-development activities
* structured progress tracking

CareerBridge addresses this gap by connecting students and graduates with suitable mentors while providing a structured career-development workflow.

The platform is particularly focused on students and graduates who may not have strong professional networks through which they can independently access mentorship.

---

# Solution

CareerBridge combines four major capabilities:

### 1. Career Profile

Students and graduates create a structured professional profile containing:

* institution
* field of study
* graduation status
* graduation year
* skills
* career interests
* optional biography
* contact information

### 2. Mentor Matching

The backend compares the student's:

* skills
* career interests

against approved and available mentors.

A weighted matching score is calculated to identify mentors whose experience and interests align with the student's profile.

### 3. Mentorship Allocation

Students can request mentorship from an available mentor.

Mentors can:

* accept requests
* decline requests
* complete accepted mentorships

### 4. Career Roadmap

Students can select an appropriate career pathway and generate a roadmap containing practical career-development tasks.

The backend tracks:

* pending tasks
* in-progress tasks
* completed tasks
* completion dates
* overall completion percentage

---

# MVP Scope

The MVP intentionally focuses on the minimum complete workflow required to demonstrate the platform's value.

## Included

* Authentication
* Authorization
* User management
* Student onboarding
* Graduate onboarding
* Mentor registration
* Mentor approval
* Mentor profiles
* Mentor availability
* Mentor discovery
* Mentor matching
* Career guidance
* Mentorship requests
* Mentorship allocation
* Mentorship completion
* Career pathways
* Career roadmap creation
* Roadmap task tracking
* Roadmap progress calculation
* Administrative user management

## Not Included in the MVP

The following are intentionally outside the current MVP scope:

* real-time chat
* email notification infrastructure
* push notifications
* payment processing
* calendar integration
* video conferencing
* AI career assistant
* advanced machine-learning recommendation models
* analytics dashboards
* microservice decomposition
* Kafka/RabbitMQ event infrastructure
* file/document uploads
* advanced mentor rating systems

These can be considered in future versions after validating the MVP.

---

# Core User Roles

CareerBridge currently supports four roles.

## STUDENT

A university student using CareerBridge for:

* career guidance
* mentor discovery
* mentorship requests
* career roadmap development
* progress tracking

## GRADUATE

A graduate using the same core career-development workflow as a student.

## MENTOR

A professional who:

* registers as a mentor
* waits for administrative approval
* completes a professional profile
* controls availability
* receives mentorship requests
* accepts or declines requests
* completes mentorship relationships

## ADMIN

An administrator responsible for:

* administrator creation
* user management
* user status management
* mentor application review
* mentor approval/rejection

---

# Core Workflow

```text
                    CAREERBRIDGE
                         │
             ┌───────────┴───────────┐
             │                       │
        STUDENT/GRADUATE           MENTOR
             │                       │
          Register                 Register
             │                       │
           Login                  Pending
             │                    Approval
             │                       │
        Complete Profile          Admin Review
             │                       │
       Skills + Interests       Approved Mentor
             │                       │
             ├──────────────┐        │
             │              │        │
      Career Guidance    Matching ◄──┘
             │
      Career Pathways
             │
       Mentor Request
             │
             ▼
          Mentor
             │
       Accept / Decline
             │
             ▼
       Mentorship
             │
          Complete
             │
             ▼
      Career Roadmap
             │
       Create Tasks
             │
      Track Progress
             │
             ▼
        Completion
```

---

# Backend Architecture

The backend follows a modular NestJS architecture.

```text
src/
├── auth/
├── career-guidance/
├── career-interests/
├── common/
├── database/
├── health/
├── matching/
├── mentors/
├── mentor-requests/
├── profile/
├── roadmaps/
├── skills/
├── users/
├── app.module.ts
└── main.ts
```

The architecture separates responsibilities by domain.

For example:

```text
ProfileModule
    │
    ├── ProfileController
    ├── ProfileService
    └── DTOs

MentorsModule
    │
    ├── MentorsController
    ├── MentorsService
    └── DTOs

MatchingModule
    │
    ├── MatchingController
    └── MatchingService
```

This makes each business capability easier to maintain and extend.

---

# Technology Stack

| Technology        | Purpose                               |
| ----------------- | ------------------------------------- |
| NestJS            | Backend application framework         |
| TypeScript        | Programming language                  |
| PostgreSQL        | Relational database                   |
| Prisma ORM        | Database access and schema management |
| Argon2id          | Password hashing                      |
| JWT               | Access-token authentication           |
| HTTP-only cookies | Refresh-token transport               |
| class-validator   | DTO validation                        |
| class-transformer | Request transformation                |
| Swagger/OpenAPI   | API documentation                     |
| Docker            | Local infrastructure                  |
| Redis             | Supporting infrastructure             |
| Git               | Version control                       |

---

# Project Structure

A simplified backend structure is:

```text
careerbridge-backend/
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── src/
│   ├── auth/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/
│   ├── profile/
│   ├── mentors/
│   ├── matching/
│   ├── career-guidance/
│   ├── mentor-requests/
│   ├── roadmaps/
│   ├── skills/
│   ├── career-interests/
│   ├── health/
│   ├── database/
│   └── common/
│
├── generated/
│   └── prisma/
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# Authentication and Authorization

CareerBridge uses JWT-based authentication with refresh-token rotation.

## Access Token

The access token is used for protected API requests.

The frontend sends:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Access tokens have a relatively short lifetime.

## Refresh Token

Refresh tokens are stored in an HTTP-only cookie.

This prevents JavaScript running in the browser from directly accessing the refresh token.

The refresh token is stored as a hashed session record in the database.

## Refresh Rotation

When the refresh endpoint is called:

1. The refresh token is validated.
2. The session is checked.
3. A new access token is issued.
4. A new refresh token is issued.
5. The previous refresh session is revoked.

## Logout

Logout revokes the refresh session and clears the refresh cookie.

Because access tokens are stateless JWTs, an already-issued access token may remain usable until its normal expiration time.

---

# Database Domain

The database models the major CareerBridge business entities.

```text
User
 │
 ├── Profile
 │     ├── ProfileSkill
 │     ├── ProfileCareerInterest
 │     └── Roadmap
 │
 └── MentorProfile
       ├── MentorSkill
       └── MentorCareerInterest

CareerInterest
 │
 └── CareerPathwayInterest
       │
       └── CareerPathway
              │
              └── Roadmap
                    │
                    └── RoadmapTask

User
 │
 └── MentorRequest
       │
       └── Feedback
```

Important entities include:

* `User`
* `Profile`
* `MentorProfile`
* `Skill`
* `CareerInterest`
* `ProfileSkill`
* `ProfileCareerInterest`
* `MentorSkill`
* `MentorCareerInterest`
* `CareerPathway`
* `CareerPathwayInterest`
* `MentorRequest`
* `Feedback`
* `Roadmap`
* `RoadmapTask`
* `RefreshSession`

---

# API Overview

The API uses the following base structure:

```text
http://localhost:3000/api/v1
```

Infrastructure endpoints use:

```text
http://localhost:3000/api
```

## Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Users

```text
POST  /api/v1/users/admin
GET   /api/v1/users
GET   /api/v1/users/:id
PATCH /api/v1/users/:id/status
```

## Profile

```text
GET   /api/v1/profile/me
PATCH /api/v1/profile/me
PATCH /api/v1/profile/me/interests
```

## Reference Data

```text
GET /api/v1/skills
GET /api/v1/career-interests
```

## Mentors

```text
GET   /api/v1/mentors
GET   /api/v1/mentors/me
PATCH /api/v1/mentors/me
PATCH /api/v1/mentors/me/availability

GET   /api/v1/mentors/applications
PATCH /api/v1/mentors/:mentorProfileId/application
```

## Matching and Career Guidance

```text
GET /api/v1/matching/mentors
GET /api/v1/career-guidance/me
```

## Mentor Requests

```text
POST  /api/v1/mentor-requests
GET   /api/v1/mentor-requests/my
GET   /api/v1/mentor-requests/received
PATCH /api/v1/mentor-requests/:requestId/respond
PATCH /api/v1/mentor-requests/:requestId/cancel
PATCH /api/v1/mentor-requests/:requestId/complete
```

## Roadmaps

```text
POST  /api/v1/roadmaps
GET   /api/v1/roadmaps/me
PATCH /api/v1/roadmaps/tasks/:taskId
```

## Health

```text
GET /api/health
```

---

# Student/Graduate Workflow

## 1. Registration

A student or graduate registers with:

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

The backend creates:

```text
User
  +
Profile
```

The new profile starts as:

```text
INCOMPLETE
```

---

## 2. Login

The user logs in and receives an access token.

The refresh token is handled through the HTTP-only cookie.

---

## 3. Profile Completion

The user updates:

* phone number
* gender
* institution
* field of study
* graduation status
* graduation year

Then they select:

* skills
* career interests

The backend automatically changes the profile status to:

```text
COMPLETE
```

when all required onboarding information is present.

---

## 4. Career Guidance

The user requests:

```http
GET /api/v1/career-guidance/me
```

The backend returns:

* profile information
* matching career pathways
* mentor recommendations

---

## 5. Mentor Matching

Mentor matching considers:

* skill overlap
* career-interest overlap

The result includes:

```json
{
  "matchScore": 100,
  "matchedSkills": [],
  "matchedInterests": []
}
```

---

## 6. Mentor Request

The student selects a mentor and sends:

```json
{
  "mentorId": "mentor-user-uuid",
  "message": "I would like guidance on transitioning into software development."
}
```

The request starts as:

```text
PENDING
```

---

## 7. Mentor Response

The mentor can:

```text
PENDING
   ├── ACCEPTED
   └── DECLINED
```

---

## 8. Mentorship Completion

An accepted request can later become:

```text
COMPLETED
```

---

## 9. Career Roadmap

The student selects a compatible career pathway and creates a roadmap.

The backend generates initial tasks.

---

## 10. Progress Tracking

Tasks can move through:

```text
PENDING
    ↓
IN_PROGRESS
    ↓
COMPLETED
```

The dashboard receives a calculated completion percentage.

---

# Mentor Workflow

A mentor registers with:

```json
{
  "email": "mentor@example.com",
  "password": "StrongPassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "MENTOR"
}
```

The backend creates:

```text
User
+
MentorProfile
```

The mentor profile starts as:

```text
applicationStatus: PENDING
isAvailable: false
```

The mentor is therefore not immediately discoverable.

An administrator reviews the application.

If approved:

```text
applicationStatus: APPROVED
isAvailable: true
```

The mentor can then:

* complete their professional profile
* select skills
* select career interests
* control availability
* receive student requests
* accept or decline requests
* complete mentorships

---

# Administrator Workflow

Administrators can:

### Manage users

```text
GET /api/v1/users
GET /api/v1/users/:id
PATCH /api/v1/users/:id/status
```

### Manage mentor applications

```text
GET /api/v1/mentors/applications
PATCH /api/v1/mentors/:mentorProfileId/application
```

A mentor application can move from:

```text
PENDING
   ├── APPROVED
   └── REJECTED
```

---

# Matching Logic

The MVP uses a transparent weighted matching algorithm.

## Skill Score

Skills account for **60%** of the total score.

```text
skillScore =
matched student skills
---------------------- × 60
total student skills
```

## Interest Score

Career interests account for **40%**.

```text
interestScore =
matched student interests
------------------------- × 40
total student interests
```

## Final Score

```text
matchScore = skillScore + interestScore
```

The result is rounded to two decimal places.

For example:

```text
Student skills: 4
Matched skills: 3

Skill contribution:
3 / 4 × 60 = 45
```

If:

```text
Student interests: 2
Matched interests: 1
```

then:

```text
Interest contribution:
1 / 2 × 40 = 20
```

Final:

```text
65%
```

Only mentors satisfying all of the following are considered:

* active user account
* approved mentor application
* available mentor

---

# Career Guidance

Career guidance combines three pieces of information:

```text
Profile
   +
Career Interests
   +
Career Pathways
   +
Mentor Matches
```

A career interest represents an area the user is interested in.

A career pathway represents a broader professional direction.

For example:

```text
Career Interest
    Artificial Intelligence
           ↓
Career Pathway
    Artificial Intelligence
           ↓
Mentor Matching
    Mentors interested in AI
```

The backend only returns active career pathways linked to the user's selected career interests.

---

# Roadmap and Progress Tracking

A roadmap belongs to:

```text
Profile + CareerPathway
```

The database prevents duplicate roadmaps for the same profile and pathway.

Each roadmap contains ordered tasks.

Example:

```text
1. Define your target career role
2. Identify required skills
3. Build a practical project
4. Build your professional profile
5. Prepare for opportunities
```

Each task has:

```text
PENDING
IN_PROGRESS
COMPLETED
```

The backend automatically calculates:

```text
totalTasks
completedTasks
inProgressTasks
pendingTasks
completionPercentage
```

For example:

```text
Total: 5
Completed: 2
In Progress: 1
Pending: 2
Completion: 40%
```

The percentage is calculated from the current task states rather than stored separately in the database.

---

# Validation and Error Handling

Global request validation is enabled.

Invalid requests are rejected before reaching business logic.

Examples include:

* invalid UUID
* invalid enum value
* missing required field
* excessively long text
* duplicate array values
* invalid array size

The API uses standard HTTP status codes.

| Status | Meaning                         |
| ------ | ------------------------------- |
| 200    | Successful request              |
| 201    | Resource created                |
| 400    | Invalid request                 |
| 401    | Authentication required/invalid |
| 403    | Authenticated but unauthorized  |
| 404    | Resource not found              |
| 409    | Business-rule conflict          |
| 500    | Unexpected server error         |

---

# Security

The backend includes several security controls.

## Password Hashing

Passwords are hashed using:

```text
Argon2id
```

Plain-text passwords are never stored.

## Authentication

Protected endpoints require a valid access token.

## Role-Based Authorization

The backend checks the user's role before executing role-specific operations.

Examples:

```text
ADMIN
STUDENT
GRADUATE
MENTOR
```

## Account Status

Users can have:

```text
ACTIVE
SUSPENDED
DEACTIVATED
```

The JWT strategy checks the current database account status.

## Refresh Session Storage

Refresh tokens are stored as hashed session records rather than plain-text database values.

## Ownership Checks

User-owned resources are checked against the authenticated user's identity.

For example, a student cannot update another student's roadmap task simply by knowing its ID.

---

# Environment Configuration

A `.env.example` file should contain the required configuration without exposing secrets.

Typical configuration includes:

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_FIRST_NAME=
ADMIN_LAST_NAME=
```

Secrets must not be committed to version control.

---

# Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run start:dev
```

Build the project:

```bash
npm run build
```

The backend runs locally at:

```text
http://localhost:3000
```

---

# Database Setup

After configuring PostgreSQL:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate dev
```

Seed initial reference data:

```bash
npm run db:seed
```

The seed process provides:

* administrator account
* skills
* career interests
* career pathways
* pathway-interest relationships

---

# API Documentation

Swagger/OpenAPI documentation is available through the application's Swagger endpoint.

The Swagger documentation provides:

* endpoint descriptions
* request schemas
* DTO validation information
* authentication requirements
* response descriptions

The Swagger interface should be used during development to inspect and test the API.

---

# Testing Checklist

The backend has been tested progressively by feature section.

## Authentication

* registration
* login
* refresh
* logout
* current user
* invalid credentials
* protected routes

## User Management

* administrator access
* user listing
* user details
* status changes
* authorization restrictions

## Profile

* profile retrieval
* profile updates
* skill selection
* career-interest selection
* automatic completion status

## Mentors

* mentor applications
* mentor approval/rejection
* mentor profile
* mentor availability
* mentor discovery

## Matching

* skill matching
* career-interest matching
* score calculation
* mentor availability restrictions

## Mentor Requests

* request creation
* request retrieval
* acceptance
* decline
* cancellation
* completion
* ownership validation

## Roadmaps

* roadmap creation
* pathway validation
* duplicate roadmap prevention
* roadmap retrieval
* task progress updates
* completed-task protection
* progress calculation

---

# MVP Completion Status

```text
0. Backend Foundation             COMPLETE
1. Domain & Database              COMPLETE
2. Authentication & Authorization COMPLETE
3. User Management                COMPLETE
4. Profile & Onboarding           COMPLETE
5. Mentor Management              COMPLETE
6. Matching & Career Guidance     COMPLETE
7. Mentor Requests & Allocation   COMPLETE
8. Roadmap & Progress             COMPLETE
```

The current backend provides the complete core MVP workflow.

At this stage, additional functionality should only be introduced if it is required by the product requirements or supported by validation from users.

---

# Future Enhancements

Potential post-MVP capabilities include:

## Communication

* mentor/student messaging
* email notifications
* push notifications
* mentorship reminders

## Scheduling

* mentor availability calendars
* session scheduling
* calendar integration
* video meeting integration

## Career Development

* richer roadmap templates
* mentor-created roadmap tasks
* milestone tracking
* portfolio integration
* CV resources

## Analytics

* mentor activity
* roadmap completion
* user engagement
* mentorship outcomes
* pathway popularity

## Recommendation Improvements

The current weighted matching system can later be extended using:

* additional profile attributes
* mentor experience
* availability preferences
* career-stage compatibility
* feedback history
* recommendation models

These should be introduced only when there is sufficient product data to justify the additional complexity.

---

# Project Status

**CareerBridge Backend MVP: Core implementation complete.**

The next phase is integration with the frontend, end-to-end testing, deployment, and product demonstration rather than adding unnecessary backend functionality.

---

# Author

**Nafisat Babamusa**

