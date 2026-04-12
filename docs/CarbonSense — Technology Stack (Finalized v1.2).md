\# CarbonSense — Technology Stack (Finalized)

\## 1. OVERVIEW

This document defines the \*\*final technology stack\*\* selected for CarbonSense based on:

\- System complexity (event-driven + async architecture)

\- Need for transactional consistency

\- Scalability requirements

\- Clean modular backend design

The stack is optimized for:

→ Reliability

→ Maintainability

→ Performance

→ Future ML extensibility

\---

\## 2. FRONTEND LAYER

\### Framework

\- Flutter

\### Supporting Tools

\- State Management: Riverpod

\- Networking: Dio

\- Local Storage: Hive / SharedPreferences

\### Responsibilities

\- UI rendering (Dashboard, Tasks, Insights, Profile)

\- User interactions (task completion, submissions)

\- API communication with backend

\- Local caching (optional for performance)

\---

\## 3. BACKEND LAYER

\### Framework

\- NestJS

\### Language

\- TypeScript

\### Architecture Style

\- Modular + Service-based architecture

\### Core Modules (Planned)

\- Auth Module

\- User Module

\- Activity Module (Daily/Weekly submission)

\- Task Module

\- Badge Module

\- Leaderboard Module

\- Streak Module

\- Personalization Module

\- Job Module (Background processing)

\### Responsibilities

\- API handling

\- Business logic execution

\- Transaction management

\- Event emission

\- Integration with queue system

\---

\## 4. DATABASE LAYER

\### Database

\- MongoDB

\### ODM

\- Mongoose

\### Key Characteristics

\- Document-based storage

\- Flexible schema for dynamic data (tasks, badges)

\- Support for transactions (critical for atomic operations)

\### Core Collections

\- users

\- user\_profiles

\- daily\_activity\_logs

\- carbon\_records

\- task\_templates

\- user\_daily\_tasks

\- badges

\- user\_badges

\- leaderboards

\- emission\_factors

\- aqi\_data

\---

\## 5. CACHE + QUEUE LAYER

\### Cache System

\- Redis

\### Queue System

\- BullMQ (Redis-based)

\### Responsibilities

\#### Redis

\- Caching frequently accessed data (leaderboard, stats)

\- Supporting queue infrastructure

\- Emission Factor Caching

- Emission factors are cached in Redis
- TTL: 7 days
- Reduces DB load
- Ensures fast emission calculations

\#### BullMQ

\- Job queue management

\- Retry handling

\- Rate limiting

\- Background processing

\---

\## 6. BACKGROUND JOB SYSTEM

\### Powered By

\- BullMQ Workers

\- NestJS Scheduler (Cron)

\### Job Types

\- Task Daily Reset Job (Midnight)

\- Task Generation Fallback Job

\- Leaderboard Update Job

\- Badge Retry Job

\- (Future) ML Processing Job

\### Flow

CRON → Dispatcher → Queue → Worker → DB

\### Guarantees

\- Non-blocking execution

\- Retry mechanism (max 3 attempts)

\- Idempotent operations

\---

\## 7. MEDIA STORAGE

\### Service

\- Cloudinary

\### Usage

\- Profile images

\- Badge assets (icons)

\### Rule

\- Only URLs stored in MongoDB

\- No binary storage in DB

\---

\## 8. AUTHENTICATION SYSTEM

\### Method

\- JWT (JSON Web Tokens)

\### Security

\- Password hashing using bcrypt

\- Stateless authentication

\---

\## 9. API DESIGN

\### Style

\- REST API

\### Key Endpoints

\- POST /auth/register

\- POST /auth/login

\- POST /activity/daily

\- GET /tasks/today

\- POST /tasks/complete

\- GET /leaderboard

\- GET /profile

\---

\## 10. DEPLOYMENT

\### Platform

\- Railway

\### Infrastructure Setup

\- Backend (NestJS) → Railway

\- MongoDB → MongoDB Atlas

\- Redis → Railway / Upstash

\- Cloudinary → External managed service

\---

\## 11. SYSTEM ARCHITECTURE (FINAL)

Flutter App

↓

NestJS Backend (API Layer)

↓

\-----------------------------------

| MongoDB (Primary Database) |

| Redis (Cache + Queue Layer) |

\-----------------------------------

↓

BullMQ Workers (Async Processing)

↓

Background Systems:

\- Task Generator

\- Badge Engine

\- Leaderboard Engine

\- Retry System

\---

\## 12. DESIGN ALIGNMENT WITH SYSTEM

This stack directly supports:

\### 1. Atomic Transactions

\- MongoDB transactions ensure:

\- No partial writes

\- Full rollback on failure

\### 2. Async Event System

\- BullMQ enables:

\- Badge evaluation (async)

\- Retry mechanisms

\- Event-driven processing

\### 3. Background Jobs

\- Cron + Queue ensures:

\- Daily task reset

\- Leaderboard updates

\### 4. Scalability

\- Horizontal worker scaling supported

\- Queue-based load distribution

\### 5. Reliability

\- Clear separation:

\- Critical path (API)

\- Non-critical async systems

\---

\## 13. FUTURE EXTENSIBILITY

The stack supports:

\- ML integration (Python microservices later)

\- Real-time features (WebSockets if needed)

\- Analytics pipeline

\- Microservices migration (if scale increases)

\---

\## FINAL SUMMARY

CarbonSense Stack =

\- Flutter (Frontend)

\- NestJS + TypeScript (Backend)

\- MongoDB + Mongoose (Database)

\- Redis (Cache)

\- BullMQ (Queue & Jobs)

\- Cloudinary (Media Storage)

\- Railway (Deployment)

→ Clean

→ Scalable

→ Event-driven

→ Production-ready