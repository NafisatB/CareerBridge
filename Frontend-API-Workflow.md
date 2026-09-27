# CareerBridge — Frontend API Workflow & Integration Contract

## Purpose of This Document

This document defines how the CareerBridge frontend should communicate with the backend.

It is intended to serve as the working contract between the frontend and backend developers.

The frontend should treat the backend as the authoritative source for:

* authentication state
* user roles
* profile completion
* mentor eligibility
* mentor matching
* mentorship request status
* career pathways
* roadmap tasks
* roadmap progress

The frontend should not recreate backend business rules independently.

---

# 1. Base URL

Local development:

```text
http://localhost:3000
```

Business API:

```text
http://localhost:3000/api/v1
```

Therefore:

```text
GET /profile/me
```

becomes:

```text
GET http://localhost:3000/api/v1/profile/me
```

Infrastructure health:

```text
GET http://localhost:3000/api/health
```

---

# 2. Authentication Contract

Protected endpoints require:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

The frontend should store/use the access token according to its chosen client-side authentication strategy.

The refresh token is handled by the backend using an HTTP-only cookie.

The frontend should not attempt to read the refresh token directly.

---

# 3. Standard Success Response

Most endpoints return their business data inside:

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

The frontend should therefore access:

```text
response.data.data
```

depending on the HTTP client being used.

For example, with Axios:

```ts
const response = await axios.get('/api/v1/profile/me');

const result = response.data.data;
```

---

# 4. Standard Error Response

Errors follow the API error structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid request.",
  "errors": [],
  "timestamp": "2026-09-27T...",
  "path": "/api/v1/profile/me"
}
```

The frontend should use:

```text
statusCode
message
errors
```

to determine what should be displayed to the user.

---

# 5. Endpoint Access Matrix

| Endpoint            |      Student |     Graduate |       Mentor |                  Admin |
| ------------------- | -----------: | -----------: | -----------: | ---------------------: |
| Register            |       Public |       Public |       Public | No public registration |
| Login               |       Public |       Public |       Public |                 Public |
| Refresh             | Auth session | Auth session | Auth session |           Auth session |
| Logout              | Auth session | Auth session | Auth session |           Auth session |
| `/auth/me`          |            ✓ |            ✓ |            ✓ |                      ✓ |
| `/users`            |            — |            — |            — |                      ✓ |
| `/profile/me`       |            ✓ |            ✓ |            — |                      — |
| `/skills`           |       Public |       Public |       Public |                 Public |
| `/career-interests` |       Public |       Public |       Public |                 Public |
| `/mentors`          |            ✓ |            ✓ |            — |                      — |
| `/mentors/me`       |            — |            — |            ✓ |                      — |
| Mentor applications |            — |            — |            — |                      ✓ |
| Matching            |            ✓ |            ✓ |            — |                      — |
| Career guidance     |            ✓ |            ✓ |            — |                      — |
| Mentor requests     |            ✓ |            ✓ |           ✓* |                      — |
| Roadmaps            |            ✓ |            ✓ |            — |                      — |

`*` Mentors use the received-request endpoints.

---

# 6. Authentication Workflow

## 6.1 Register Student

### Request

```http
POST /api/v1/auth/register
```

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

### Expected behavior

Backend creates:

```text
User
Profile
```

The profile starts as:

```text
INCOMPLETE
```

### Frontend behavior

After successful registration:

```text
Registration form
       ↓
Successful response
       ↓
Redirect to Login
```

---

# 7. Login

### Request

```http
POST /api/v1/auth/login
```

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123!"
}
```

### Frontend expectation

The frontend receives authentication information containing the access token/user information according to the authentication response contract.

The refresh token is handled through the HTTP-only cookie.

### Frontend flow

```text
Login
 ↓
Store access-token state
 ↓
Fetch /auth/me
 ↓
Determine role
 ↓
Redirect to appropriate dashboard
```

---

# 8. Get Current User

```http
GET /api/v1/auth/me
```

### Purpose

Used by the frontend to restore the authenticated user after page refresh or application startup.

### Example

```json
{
  "user": {
    "id": "user-uuid",
    "email": "student@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "STUDENT",
    "status": "ACTIVE"
  }
}
```

### Frontend use

The frontend can use:

```ts
user.role
```

to determine which dashboard to display.

---

# 9. Refresh Access Token

```http
POST /api/v1/auth/refresh
```

No refresh token should be manually added to the request body.

The browser sends the HTTP-only refresh cookie.

### Frontend behavior

If an API request returns:

```text
401 Unauthorized
```

because the access token has expired, the frontend authentication layer can attempt:

```text
POST /auth/refresh
```

Then retry the original request if refresh succeeds.

If refresh fails:

```text
Clear authenticated state
Redirect to login
```

---

# 10. Logout

```http
POST /api/v1/auth/logout
```

### Frontend behavior

After successful logout:

```text
Clear local authentication state
Clear cached user data
Redirect to login
```

---

# 11. Student/Graduate Profile Workflow

## 11.1 Get Profile

```http
GET /api/v1/profile/me
```

### Example response

```json
{
  "profile": {
    "id": "profile-uuid",
    "status": "COMPLETE",
    "phoneNumber": "08012345678",
    "gender": "FEMALE",
    "institutionName": "University of Lagos",
    "fieldOfStudy": "Industrial Chemistry",
    "graduationStatus": "FINAL_YEAR",
    "graduationYear": 2027,
    "bio": "Interested in software development and computational science.",
    "profileSkills": [
      {
        "skill": {
          "id": "skill-uuid",
          "name": "Python"
        }
      }
    ],
    "careerInterests": [
      {
        "careerInterest": {
          "id": "interest-uuid",
          "name": "Artificial Intelligence"
        }
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Important

The frontend should read:

```text
profile.status
```

rather than calculating profile completion itself.

---

# 12. Update Profile

```http
PATCH /api/v1/profile/me
```

### Example

```json
{
  "phoneNumber": "08012345678",
  "gender": "FEMALE",
  "institutionName": "University of Lagos",
  "fieldOfStudy": "Industrial Chemistry",
  "graduationStatus": "FINAL_YEAR",
  "graduationYear": 2027,
  "bio": "Interested in software development and computational science."
}
```

### Important

Skills and career interests are handled separately.

Do not send:

```json
{
  "skills": [],
  "careerInterests": []
}
```

to this endpoint.

Use:

```text
PATCH /api/v1/profile/me/interests
```

for those.

---

# 13. Update Skills and Career Interests

```http
PATCH /api/v1/profile/me/interests
```

### Request

```json
{
  "skillIds": [
    "skill-uuid-1",
    "skill-uuid-2"
  ],
  "careerInterestIds": [
    "interest-uuid-1",
    "interest-uuid-2"
  ]
}
```

### Backend behavior

The backend:

1. validates the IDs
2. replaces the existing profile relationships
3. recalculates profile completion
4. returns the updated profile

---

# 14. Profile Completion

The frontend should display onboarding as complete when:

```text
profile.status === "COMPLETE"
```

The frontend should not independently determine this using:

```ts
phoneNumber &&
gender &&
institutionName &&
...
```

The backend owns this decision.

---

# 15. Reference Data

## Get Skills

```http
GET /api/v1/skills
```

### Example

```json
{
  "skills": [
    {
      "id": "uuid",
      "name": "Communication"
    },
    {
      "id": "uuid",
      "name": "JavaScript"
    },
    {
      "id": "uuid",
      "name": "Python"
    }
  ]
}
```

The frontend can use this to populate a multi-select component.

---

## Get Career Interests

```http
GET /api/v1/career-interests
```

### Example

```json
{
  "careerInterests": [
    {
      "id": "uuid",
      "name": "Artificial Intelligence"
    },
    {
      "id": "uuid",
      "name": "Data Science"
    },
    {
      "id": "uuid",
      "name": "Software Development"
    }
  ]
}
```

---

# 16. Mentor Discovery

```http
GET /api/v1/mentors
```

Available to students and graduates.

### Example response

```json
{
  "mentors": [
    {
      "id": "mentor-profile-uuid",
      "professionalTitle": "Senior Software Engineer",
      "organisation": "Tech Company",
      "yearsOfExperience": 5,
      "bio": "Software engineer with experience mentoring early-career developers.",
      "user": {
        "id": "mentor-user-uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "skills": [
        {
          "id": "skill-uuid",
          "name": "Communication"
        }
      ],
      "careerInterests": [
        {
          "id": "interest-uuid",
          "name": "Artificial Intelligence"
        }
      ]
    }
  ]
}
```

---

# 17. Mentor Matching

```http
GET /api/v1/matching/mentors
```

### Example

```json
{
  "matches": [
    {
      "mentor": {
        "id": "mentor-user-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "professionalTitle": "Senior Software Engineer",
        "organisation": "Tech Company",
        "yearsOfExperience": 5,
        "bio": "Software engineer with experience mentoring early-career developers.",
        "skills": [
          {
            "id": "skill-uuid",
            "name": "Communication"
          }
        ],
        "careerInterests": [
          {
            "id": "interest-uuid",
            "name": "Artificial Intelligence"
          }
        ]
      },
      "matchScore": 100,
      "matchedSkills": [
        {
          "id": "skill-uuid",
          "name": "Communication"
        }
      ],
      "matchedInterests": [
        {
          "id": "interest-uuid",
          "name": "Artificial Intelligence"
        }
      ]
    }
  ],
  "total": 1
}
```

## Important ID rule

The:

```text
mentor.id
```

returned by matching is the **mentor's User ID**.

That ID should be sent when creating a mentor request.

Do not substitute the mentor profile ID.

---

# 18. Career Guidance

```http
GET /api/v1/career-guidance/me
```

### Example

```json
{
  "profile": {
    "status": "COMPLETE",
    "fieldOfStudy": "Industrial Chemistry",
    "graduationStatus": "FINAL_YEAR",
    "graduationYear": 2027,
    "careerInterests": [
      {
        "id": "interest-uuid",
        "name": "Artificial Intelligence"
      }
    ]
  },
  "pathways": [
    {
      "id": "pathway-uuid",
      "name": "Artificial Intelligence",
      "description": "A career pathway focused on...",
      "matchedInterests": [
        {
          "id": "interest-uuid",
          "name": "Artificial Intelligence"
        }
      ]
    }
  ],
  "mentors": []
}
```

### Frontend dashboard use

This endpoint can populate:

```text
Career Guidance
├── Current Profile
├── Career Interests
├── Recommended Career Pathways
└── Recommended Mentors
```

If no career interests exist, the backend returns a validation error asking the user to add at least one career interest.

---

# 19. Mentor Request

```http
POST /api/v1/mentor-requests
```

### Request

```json
{
  "mentorId": "mentor-user-uuid",
  "message": "I would like guidance on transitioning into software development."
}
```

### Expected response

```json
{
  "request": {
    "id": "request-uuid",
    "studentId": "student-user-uuid",
    "mentorId": "mentor-user-uuid",
    "status": "PENDING",
    "message": "I would like guidance on transitioning into software development.",
    "requestedAt": "...",
    "respondedAt": null,
    "completedAt": null
  }
}
```

### Frontend behavior

After successful request:

```text
Request Mentor
      ↓
Button changes to:
"Request Pending"
```

The frontend should use:

```text
status === "PENDING"
```

rather than assuming the request succeeded permanently.

---

# 20. Student's Requests

```http
GET /api/v1/mentor-requests/my
```

### Frontend use

Display:

```text
My Mentorship Requests

John Doe
Senior Software Engineer

Status: PENDING
```

Possible statuses:

```text
PENDING
ACCEPTED
DECLINED
CANCELLED
COMPLETED
```

---

# 21. Mentor's Received Requests

```http
GET /api/v1/mentor-requests/received
```

Mentor dashboard example:

```text
Mentorship Requests

Jane Doe
Industrial Chemistry
Interested in Artificial Intelligence

Status: PENDING

[Accept] [Decline]
```

---

# 22. Mentor Responds

```http
PATCH /api/v1/mentor-requests/:requestId/respond
```

### Accept

```json
{
  "status": "ACCEPTED"
}
```

### Decline

```json
{
  "status": "DECLINED"
}
```

The frontend should not allow arbitrary statuses here.

Only:

```text
ACCEPTED
DECLINED
```

are valid responses.

---

# 23. Student Cancels Request

```http
PATCH /api/v1/mentor-requests/:requestId/cancel
```

No request body is required.

The request must still be:

```text
PENDING
```

The frontend can therefore display:

```text
Cancel Request
```

only while the request is pending.

---

# 24. Mentor Completes Mentorship

```http
PATCH /api/v1/mentor-requests/:requestId/complete
```

No request body is required.

The request must currently be:

```text
ACCEPTED
```

After successful completion:

```text
status = COMPLETED
completedAt = timestamp
```

---

# 25. Mentor Registration

```http
POST /api/v1/auth/register
```

### Request

```json
{
  "email": "mentor@example.com",
  "password": "StrongPassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "MENTOR"
}
```

### Important

The mentor is created but is not immediately available.

Initial state:

```text
applicationStatus = PENDING
isAvailable = false
```

The frontend should communicate that the application is awaiting review.

---

# 26. Mentor Application — Admin

```http
GET /api/v1/mentors/applications
```

Admin dashboard can display:

```text
John Doe
Senior Software Engineer
Application: PENDING
```

---

# 27. Approve or Reject Mentor

```http
PATCH /api/v1/mentors/:mentorProfileId/application
```

### Approve

```json
{
  "status": "APPROVED"
}
```

### Reject

```json
{
  "status": "REJECTED"
}
```

After approval:

```text
applicationStatus = APPROVED
isAvailable = true
```

After rejection:

```text
applicationStatus = REJECTED
isAvailable = false
```

---

# 28. Mentor Own Profile

```http
GET /api/v1/mentors/me
```

The mentor can retrieve their own professional profile.

---

# 29. Update Mentor Profile

```http
PATCH /api/v1/mentors/me
```

Example:

```json
{
  "professionalTitle": "Senior Software Engineer",
  "organisation": "Tech Company",
  "yearsOfExperience": 5,
  "bio": "Software engineer with experience mentoring early-career developers.",
  "skillIds": [
    "skill-uuid-1",
    "skill-uuid-2"
  ],
  "careerInterestIds": [
    "interest-uuid-1"
  ]
}
```

The frontend should not attempt to update:

```text
applicationStatus
isAvailable
```

through this endpoint.

Those are controlled through their dedicated workflows.

---

# 30. Mentor Availability

```http
PATCH /api/v1/mentors/me/availability
```

The frontend sends the availability value according to the DTO contract.

Conceptually:

```json
{
  "isAvailable": true
}
```

Only approved mentors can change their availability.

---

# 31. Create Career Roadmap

```http
POST /api/v1/roadmaps
```

### Request

```json
{
  "pathwayId": "career-pathway-uuid"
}
```

The pathway ID should come from:

```text
GET /api/v1/career-guidance/me
```

or another trusted pathway source.

### Successful response

```json
{
  "id": "roadmap-uuid",
  "pathwayId": "pathway-uuid",
  "pathway": {
    "id": "pathway-uuid",
    "name": "Data Science",
    "description": "..."
  },
  "tasks": [
    {
      "id": "task-1",
      "title": "Define your target career role",
      "description": "...",
      "order": 1,
      "status": "PENDING",
      "completedAt": null
    },
    {
      "id": "task-2",
      "title": "Identify required skills",
      "description": "...",
      "order": 2,
      "status": "PENDING",
      "completedAt": null
    }
  ]
}
```

---

# 32. Roadmap Creation Errors

## Invalid pathway ID

```text
400 Bad Request
```

## Pathway doesn't exist

```text
404 Not Found
```

## Pathway is inactive

```text
409 Conflict
```

## Pathway doesn't match user's interests

```text
409 Conflict
```

## Roadmap already exists

```text
409 Conflict
```

The frontend should display the appropriate message rather than attempting to create the same roadmap repeatedly.

---

# 33. Retrieve My Roadmaps

```http
GET /api/v1/roadmaps/me
```

### Example

```json
{
  "roadmaps": [
    {
      "id": "roadmap-uuid",
      "pathwayId": "pathway-uuid",
      "pathway": {
        "id": "pathway-uuid",
        "name": "Data Science",
        "description": "A career pathway..."
      },
      "progress": {
        "totalTasks": 5,
        "completedTasks": 2,
        "inProgressTasks": 1,
        "pendingTasks": 2,
        "completionPercentage": 40
      },
      "tasks": [
        {
          "id": "task-uuid",
          "title": "Define your target career role",
          "description": "...",
          "order": 1,
          "status": "COMPLETED",
          "completedAt": "2026-09-27T..."
        },
        {
          "id": "task-uuid",
          "title": "Identify required skills",
          "description": "...",
          "order": 2,
          "status": "IN_PROGRESS",
          "completedAt": null
        }
      ]
    }
  ],
  "total": 1
}
```

---

# 34. Roadmap Dashboard

The frontend can directly use:

```text
progress.totalTasks
progress.completedTasks
progress.inProgressTasks
progress.pendingTasks
progress.completionPercentage
```

For example:

```text
Career Roadmap

Data Science

████████░░ 40%

2 / 5 tasks completed

✓ Define your target career role
◐ Identify required skills
○ Build a practical project
○ Build your professional profile
○ Prepare for opportunities
```

No frontend calculation is necessary.

---

# 35. Update Roadmap Task

```http
PATCH /api/v1/roadmaps/tasks/:taskId
```

### Start task

```json
{
  "status": "IN_PROGRESS"
}
```

### Complete task

```json
{
  "status": "COMPLETED"
}
```

### Important

The frontend does not send:

```json
{
  "completedAt": "..."
}
```

The backend sets `completedAt`.

---

# 36. Task State Rules

Valid progression:

```text
PENDINGa
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

Once a task is completed, the backend does not allow it to return to:

```text
PENDING
```

or:

```text
IN_PROGRESS
```

The frontend should therefore treat:

```text
COMPLETED
```

as a final task state.

---

# 37. Recommended Frontend Screen Flow

## Public

```text
Landing Page
    │
    ├── Register
    └── Login
```

## Student/Graduate

```text
Login
  ↓
Dashboard
  ↓
Profile Completion
  ↓
Career Guidance
  ├── Career Pathways
  └── Mentor Matches
          ↓
     Mentor Profile
          ↓
     Request Mentor
          ↓
   My Mentorships
          ↓
     Career Roadmap
          ↓
     Task Progress
```

## Mentor

```text
Login
  ↓
Mentor Dashboard
  ↓
Application Status
  ↓
Professional Profile
  ↓
Availability
  ↓
Received Requests
  ↓
Accept / Decline
  ↓
Complete Mentorship
```

## Admin

```text
Login
  ↓
Admin Dashboard
  ├── Users
  ├── User Status
  └── Mentor Applications
          ├── Approve
          └── Reject
```

---

# 38. Frontend State Recommendations

The frontend can maintain authenticated user state:

```ts
type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'GRADUATE' | 'MENTOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
};
```

Profile:

```ts
type ProfileStatus = 'INCOMPLETE' | 'COMPLETE';
```

Mentor application:

```ts
type MentorApplicationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';
```

Mentor request:

```ts
type MentorRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED';
```

Roadmap task:

```ts
type RoadmapTaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED';
```

---

# 39. Important Frontend Rules

## Rule 1 — Do not calculate profile completion

Use:

```ts
profile.status
```

## Rule 2 — Do not calculate mentor match scores

Use:

```ts
match.matchScore
```

## Rule 3 — Do not calculate roadmap progress

Use:

```ts
roadmap.progress.completionPercentage
```

## Rule 4 — Do not generate roadmap tasks

The backend creates the initial tasks.

## Rule 5 — Do not decide mentor eligibility

The backend determines which mentors are approved and available.

## Rule 6 — Use backend IDs exactly as returned

Especially for mentor requests:

```text
matching.mentor.id
```

is the mentor's `User.id`.

## Rule 7 — Handle HTTP errors explicitly

For example:

```text
401 → authentication problem
403 → permission problem
404 → resource not found
409 → business-rule conflict
```

---

# 40. End-to-End Student Example

A complete frontend session can look like this:

### Step 1

```http
POST /auth/register
```

### Step 2

```http
POST /auth/login
```

### Step 3

```http
GET /auth/me
```

### Step 4

```http
GET /profile/me
```

If:

```json
{
  "status": "INCOMPLETE"
}
```

redirect to onboarding.

### Step 5

```http
GET /skills
GET /career-interests
```

Populate selection controls.

### Step 6

```http
PATCH /profile/me
```

Save academic/profile information.

### Step 7

```http
PATCH /profile/me/interests
```

Save skills and career interests.

### Step 8

```http
GET /career-guidance/me
```

Display:

```text
Career pathways
Mentor recommendations
```

### Step 9

```http
POST /mentor-requests
```

Request mentorship.

### Step 10

```http
GET /mentor-requests/my
```

Display request status.

### Step 11

```http
POST /roadmaps
```

Create a roadmap from a recommended pathway.

### Step 12

```http
GET /roadmaps/me
```

Display roadmap and progress.

### Step 13

```http
PATCH /roadmaps/tasks/:taskId
```

Update task progress.

### Step 14

```http
GET /roadmaps/me
```

Refresh the dashboard progress.

---

# 41. Backend/Frontend Responsibility Boundary

## Backend owns

```text
Authentication
Authorization
Profile completion
Mentor eligibility
Mentor approval
Matching
Match score
Career pathway eligibility
Mentor request state
Roadmap creation
Roadmap task ownership
Task state
Completion timestamps
Progress calculation
```

## Frontend owns

```text
Forms
Navigation
Loading states
Error presentation
Dashboard layout
Cards
Tables
Charts
Progress bars
Modals
Buttons
Client-side UI state
```

The frontend should display backend decisions rather than recreate business logic.

---

# 42. Final Integration Principle

The frontend should think of the backend as the source of truth.

For example:

```text
Frontend asks:
"What is my profile status?"

Backend:
"COMPLETE"

Frontend displays:
"Profile complete"
```

Similarly:

```text
Frontend asks:
"How suitable is this mentor?"

Backend:
"matchScore = 82.5"

Frontend displays:
"82.5% match"
```

And:

```text
Frontend asks:
"How far have I progressed?"

Backend:
"completionPercentage = 60"

Frontend displays:
"60% complete"
```

This keeps the frontend relatively simple while ensuring that business rules remain consistent across all clients.

---

# 43. MVP Integration Checklist

Before the final demonstration, the frontend and backend teams should verify:

### Authentication

* [ ] Register student
* [ ] Register graduate
* [ ] Register mentor
* [ ] Login
* [ ] Refresh token
* [ ] Logout
* [ ] Protected route behavior

### Student/Graduate

* [ ] Profile retrieval
* [ ] Profile update
* [ ] Skill selection
* [ ] Career-interest selection
* [ ] Profile completion
* [ ] Career guidance
* [ ] Mentor matching
* [ ] Mentor request
* [ ] Request status
* [ ] Roadmap creation
* [ ] Roadmap retrieval
* [ ] Task progress
* [ ] Progress percentage

### Mentor

* [ ] Registration
* [ ] Pending application
* [ ] Profile update
* [ ] Availability
* [ ] Received requests
* [ ] Accept request
* [ ] Decline request
* [ ] Complete mentorship

### Admin

* [ ] User list
* [ ] User details
* [ ] User status management
* [ ] Mentor applications
* [ ] Approve mentor
* [ ] Reject mentor

### Error Handling

* [ ] 400
* [ ] 401
* [ ] 403
* [ ] 404
* [ ] 409

### Final

* [ ] Frontend environment variables configured
* [ ] Backend URL configured
* [ ] CORS verified
* [ ] Swagger checked
* [ ] Production build tested
* [ ] End-to-end workflow tested
