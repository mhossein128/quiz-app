# Implementation Plan

- [x] 1. Setup database and ORM

  - [x] 1.1 Install Prisma and dependencies

    - Install prisma, @prisma/client, bcryptjs, jsonwebtoken
    - Initialize Prisma with SQLite provider
    - _Requirements: 1.1, 2.3_

  - [x] 1.2 Create Prisma schema with all models

    - Define User, Quiz, Question, Option, QuizAttempt models
    - Setup relations and indexes
    - _Requirements: 1.1, 4.1, 5.3_

  - [x] 1.3 Create Prisma client singleton

    - Create src/lib/prisma.js for database connection
    - _Requirements: 1.1_

  - [x] 1.4 Run initial migration
    - Generate and apply database migration
    - _Requirements: 1.1_

- [x] 2. Implement authentication API

  - [x] 2.1 Create register endpoint

    - POST /api/auth/register with username/password validation
    - Hash password with bcrypt, create user with default role
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 Create login endpoint

    - POST /api/auth/login with credential validation
    - Generate JWT token on success
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.3 Create me endpoint

    - GET /api/auth/me to get current user from JWT
    - _Requirements: 2.1, 2.3_

  - [x] 2.4 Create auth middleware utility

    - JWT verification helper for protected routes
    - _Requirements: 2.3, 6.4_

  - [ ]\* 2.5 Write property tests for authentication
    - **Property 1: Registration creates user with correct default role**
    - **Property 2: Empty credentials rejection**
    - **Property 3: Authentication round-trip**
    - **Property 4: Invalid credentials rejection**
    - **Validates: Requirements 1.1, 1.3, 1.4, 2.1, 2.2, 2.3**

- [x] 3. Implement quiz API

  - [x] 3.1 Create quiz list endpoint

    - GET /api/quizzes returns all quizzes with question count
    - Include user's previous scores if available
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Create quiz detail endpoint

    - GET /api/quizzes/[id] returns quiz with questions and options
    - Exclude correct answer info from response
    - _Requirements: 4.1, 4.4_

  - [x] 3.3 Create quiz creation endpoint (admin only)

    - POST /api/quizzes with admin role check
    - Validate 4 options per question, one correct
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]\* 3.4 Write property tests for quiz API
    - **Property 5: Quiz list completeness**
    - **Property 6: Quiz data integrity**
    - **Property 9: Admin access control**
    - **Validates: Requirements 3.1, 3.2, 4.1, 6.2, 6.4, 7.2, 7.3**

- [x] 4. Implement attempt API

  - [x] 4.1 Create submit attempt endpoint

    - POST /api/attempts with quiz answers
    - Calculate score by comparing with correct options
    - Store attempt record in database
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 4.2 Create attempt detail endpoint

    - GET /api/attempts/[id] returns attempt with score details
    - _Requirements: 5.2, 5.4_

  - [ ]\* 4.3 Write property tests for attempt API
    - **Property 7: Score calculation correctness**
    - **Property 8: Attempt persistence round-trip**
    - **Validates: Requirements 5.1, 5.3, 5.4**

- [ ] 5. Checkpoint - Ensure all API tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update auth context for new API

  - [x] 6.1 Update JWT auth provider

    - Modify src/auth/context/jwt/auth-provider.jsx for new endpoints
    - Update action.js with register/login/logout functions
    - _Requirements: 2.1, 2.3, 2.4_

  - [x] 6.2 Update sign-in view

    - Modify src/auth/view/jwt/jwt-sign-in-view.jsx for new API
    - _Requirements: 2.1, 2.2_

  - [x] 6.3 Update sign-up view
    - Modify src/auth/view/jwt/jwt-sign-up-view.jsx for new API
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Create dashboard quiz list page

  - [x] 7.1 Create quiz list component

    - Display quizzes as cards with title, description, question count
    - Show previous score badge if user has attempted
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 7.2 Update dashboard page
    - Replace placeholder with quiz list
    - Add loading and empty states
    - _Requirements: 3.1_

- [x] 8. Create quiz taking page

  - [x] 8.1 Create quiz page with question display

    - src/app/dashboard/quiz/[id]/page.jsx
    - Fetch quiz data and display questions one at a time
    - _Requirements: 4.1, 4.4_

  - [x] 8.2 Create question navigation and answer selection

    - Track selected answers in state
    - Show progress indicator (question X of Y)
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 8.3 Create quiz submission logic
    - Submit answers to API on completion
    - Redirect to results page
    - _Requirements: 4.3, 5.1_

- [x] 9. Create results page

  - [x] 9.1 Create results page with score display

    - src/app/dashboard/results/[attemptId]/page.jsx
    - Show score, correct/incorrect counts
    - _Requirements: 5.2, 5.4_

  - [x] 9.2 Add score chart visualization
    - Use ApexCharts to display score as donut/pie chart
    - _Requirements: 5.2_

- [x] 10. Create admin quiz creation page

  - [x] 10.1 Create admin route with role guard

    - src/app/dashboard/admin/create-quiz/page.jsx
    - Check admin role, redirect if not admin
    - _Requirements: 6.4_

  - [x] 10.2 Create quiz creation form

    - Form for title, description, and dynamic question list
    - Each question has 4 options with correct answer selection
    - _Requirements: 6.1, 6.2_

  - [x] 10.3 Implement form submission
    - Validate and submit to API
    - Show success/error feedback
    - _Requirements: 6.3_

- [x] 11. Update navigation

  - [x] 11.1 Update nav config
    - Add quiz-related menu items to nav-config-dashboard
    - Add admin menu item (visible only to admins)
    - _Requirements: 3.1, 6.1_

- [ ] 12. Create seed data

  - [ ] 12.1 Expand seed script to 4 quizzes with 20 questions each

    - prisma/seed.js currently has 2 quizzes, needs 4 total
    - Each quiz should have exactly 20 questions with 4 options
    - Ensure default admin user exists
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 12.2 Configure seed command in package.json
    - Add prisma db seed command
    - _Requirements: 7.1_

- [ ] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
