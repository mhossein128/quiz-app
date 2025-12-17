# Requirements Document

## Introduction

سیستم آزمون آنلاین یک پلتفرم ساده دانشگاهی است که به کاربران امکان ثبت‌نام، ورود، شرکت در آزمون‌های چهارگزینه‌ای و مشاهده نتایج را می‌دهد. این سیستم بر پایه Next.js با قالب Minimal MUI ساخته شده و از Prisma به عنوان ORM و PostgreSQL به عنوان دیتابیس استفاده می‌کند. API‌ها به صورت داخلی (Next.js API Routes) پیاده‌سازی می‌شوند.

## Glossary

- **Quiz_System**: سیستم اصلی آزمون آنلاین
- **User**: کاربر سیستم که می‌تواند نقش user یا admin داشته باشد
- **Quiz**: آزمون شامل مجموعه‌ای از سوالات چهارگزینه‌ای
- **Question**: سوال چهارگزینه‌ای با یک پاسخ صحیح
- **Option**: گزینه‌های پاسخ برای هر سوال
- **QuizAttempt**: رکورد شرکت کاربر در یک آزمون شامل نمره و تاریخ
- **Admin**: کاربر با نقش مدیر که امکان ایجاد آزمون جدید را دارد

## Requirements

### Requirement 1

**User Story:** As a user, I want to register with a username and password, so that I can create an account and access the quiz system.

#### Acceptance Criteria

1. WHEN a user submits a registration form with username and password THEN the Quiz_System SHALL create a new user account and store credentials securely
2. WHEN a user attempts to register with an existing username THEN the Quiz_System SHALL reject the registration and display an appropriate error message
3. WHEN a user submits a registration form with empty username or password THEN the Quiz_System SHALL prevent registration and display validation errors
4. WHEN a new user is registered THEN the Quiz_System SHALL assign the default role of "user" to the account

### Requirement 2

**User Story:** As a user, I want to log in with my username and password, so that I can access my dashboard and take quizzes.

#### Acceptance Criteria

1. WHEN a user submits valid credentials THEN the Quiz_System SHALL authenticate the user and redirect to the dashboard
2. WHEN a user submits invalid credentials THEN the Quiz_System SHALL reject the login and display an error message
3. WHEN a user is authenticated THEN the Quiz_System SHALL generate a JWT token for session management
4. WHEN a user logs out THEN the Quiz_System SHALL invalidate the session and redirect to the login page

### Requirement 3

**User Story:** As a user, I want to view a list of available quizzes on my dashboard, so that I can choose which quiz to take.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard THEN the Quiz_System SHALL display a list of all available quizzes with title and description
2. WHEN quizzes are displayed THEN the Quiz_System SHALL show the number of questions for each quiz
3. WHEN a user has previously completed a quiz THEN the Quiz_System SHALL display the previous score alongside the quiz

### Requirement 4

**User Story:** As a user, I want to take a quiz by answering multiple-choice questions, so that I can test my knowledge.

#### Acceptance Criteria

1. WHEN a user starts a quiz THEN the Quiz_System SHALL display questions one at a time with four options each
2. WHEN a user selects an answer THEN the Quiz_System SHALL record the selection and allow navigation to the next question
3. WHEN a user completes all questions THEN the Quiz_System SHALL allow submission of the quiz
4. WHEN displaying a question THEN the Quiz_System SHALL show the question number and total question count

### Requirement 5

**User Story:** As a user, I want to see my quiz results with a score chart after completion, so that I can understand my performance.

#### Acceptance Criteria

1. WHEN a user submits a completed quiz THEN the Quiz_System SHALL calculate the score based on correct answers
2. WHEN displaying results THEN the Quiz_System SHALL show the score as a percentage in a visual chart
3. WHEN a quiz is completed THEN the Quiz_System SHALL store the attempt record with score and timestamp in the database
4. WHEN displaying results THEN the Quiz_System SHALL show the number of correct and incorrect answers

### Requirement 6

**User Story:** As an admin, I want to create new quizzes with questions and options, so that I can provide new content for users.

#### Acceptance Criteria

1. WHEN an admin accesses the quiz creation page THEN the Quiz_System SHALL display a form for quiz title, description, and questions
2. WHEN an admin adds a question THEN the Quiz_System SHALL require four options and one correct answer selection
3. WHEN an admin submits a new quiz THEN the Quiz_System SHALL validate all fields and store the quiz in the database
4. IF a non-admin user attempts to access quiz creation THEN the Quiz_System SHALL deny access and redirect to dashboard

### Requirement 7

**User Story:** As a system administrator, I want seed data with 4 quizzes of 20 questions each, so that the system has initial content for testing.

#### Acceptance Criteria

1. WHEN the database is seeded THEN the Quiz_System SHALL create 4 quizzes in different subject areas
2. WHEN seeding quizzes THEN the Quiz_System SHALL create exactly 20 questions per quiz with 4 options each
3. WHEN seeding questions THEN the Quiz_System SHALL mark exactly one option as correct for each question
4. WHEN seeding is complete THEN the Quiz_System SHALL create a default admin user for system management
