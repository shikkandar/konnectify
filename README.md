# Konnectify

A NestJS monorepo application with a main API service and background worker.

## Project Structure

```
konnectify/
├── apps/
│   ├── komp/              # Main application
│   │   ├── src/
│   │   └── tsconfig.app.json
│   └── worker/            # Background worker service
│       ├── src/
│       └── tsconfig.app.json
├── libs/
│   └── database/          # Shared database library with Prisma
│       ├── src/
│       │   ├── database.module.ts
│       │   ├── prisma.service.ts
│       │   └── index.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── tsconfig.lib.json
├── nest-cli.json
├── .env                   # Environment variables for the project
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js (>= 16.x)
- npm (>= 8.x) 
- PostgreSQL (>= 14.x)

## Installation

```bash
# Install dependencies
npm install
```

## Database Setup

1. Create a PostgreSQL database
2. Configure database connection in `.env` file at the project root:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase?schema=public"
```

3. Generate Prisma client and apply migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev
```

## Development

### Running applications

```bash
# Run main application in development mode
npm run start:komp:dev

# Run worker in development mode
npm run start:worker:dev
```

### Database Management

```bash
# Open Prisma Studio database interface
npm run prisma:studio

# Create new migration
npm run prisma:migrate:dev -- --name migration_name

# Reset database (caution: deletes all data)
npm run prisma:reset
```

## Building for Production

```bash
# Build all applications
npm run build

# Build specific applications
npm run build:komp
npm run build:worker
```

## Running in Production

```bash
# Run main application
node dist/apps/komp/main.js

# Run worker
node dist/apps/worker/main.js
```

## Available Scripts

- `start:komp` - Start the main application
- `start:komp:dev` - Start the main application in watch mode
- `start:worker` - Start the worker
- `start:worker:dev` - Start the worker in watch mode
- `build` - Build all applications
- `build:komp` - Build the main application
- `build:worker` - Build the worker
- `prisma:generate` - Generate Prisma client
- `prisma:migrate:dev` - Create and apply migrations in development
- `prisma:migrate:deploy` - Apply migrations in production
- `prisma:reset` - Reset the database
- `prisma:studio` - Open Prisma Studio

## Adding New Applications

```bash
nest generate app new-app-name
```

## Adding New Libraries

```bash
nest generate library new-lib-name
```

## Architecture Decisions

- **Monorepo Structure**: Using NestJS built-in monorepo support for code sharing and consistency
- **Shared Database Library**: Centralizing Prisma setup in a shared library for DRY principles
- **Separation of Concerns**: Main app handles user requests while worker handles background processing
- **Scalability Focus**: Designed to scale horizontally with separate worker processes

## License

[License information goes here]


# Database Library

This library provides a shared database layer for the Konnectify monorepo using Prisma ORM.

## Structure

```
libs/database/
├── src/
│   ├── database.module.ts   # Main module that provides PrismaService
│   ├── prisma.service.ts    # Service that extends PrismaClient
│   └── index.ts             # Exports
├── prisma/
│   ├── schema.prisma        # Prisma schema definition
│   └── migrations/          # Database migrations
└── tsconfig.lib.json        # TypeScript configuration
```

## Setup

1. Configure your database connection string in the root `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase?schema=public"
```

2. Generate the Prisma client:

```bash
npm run prisma:generate
```

3. Run migrations:

```bash
npm run prisma:migrate:dev
```

## Usage

Import the `DatabaseModule` in your application modules:

```typescript
// In apps/komp/src/app.module.ts or apps/worker/src/app.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  // ...
})
export class AppModule {}
```

Inject and use the `PrismaService` in your services:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }
}
```

## Database Commands

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Create New Migration

```bash
npm run prisma:migrate:dev -- --name added_user_role
```

### Apply Migrations (Production)

```bash
npm run prisma:migrate:deploy
```

### Reset Database

```bash
npm run prisma:reset
```

### Open Prisma Studio

```bash
npm run prisma:studio
```

## Schema Updates

1. Modify the schema in `libs/database/prisma/schema.prisma`
2. Create a migration: `npm run prisma:migrate:dev -- --name your_change_name`
3. Generate the Prisma client: `npm run prisma:generate`
4. Use the updated models in your application

## Transaction Example

```typescript
async createUserWithProfile(userData, profileData) {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData,
    });
    
    const profile = await tx.profile.create({
      data: {
        ...profileData,
        userId: user.id,
      },
    });
    
    return { user, profile };
  });
}
```

## Development Guidelines

1. Always create migrations for schema changes
2. Don't modify migration files manually after creation
3. Use indexes on frequently queried fields
4. Place database-related DTOs and interfaces in this library
5. Consider extracting repository patterns for complex models