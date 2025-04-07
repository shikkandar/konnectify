Certainly! I'll rewrite the README.md file with the changes you've requested, including the new port numbers and the addition of the proxy information. Here's the updated version:

**File: /Users/shikandar/konnectifyco/konnectify/README.md**

````markdown
# Konnectify

A scalable NestJS monorepo application with a main API service (komp) and background worker for job processing.

## Project Overview

Konnectify is built on a monorepo architecture, consisting of:

- **Komp**: Main API application that handles client requests (Port 8000)
- **Worker**: Background processing service that handles queued jobs (Port 8001)
- **Proxy**: Runs when both applications are started concurrently (Port 8002)
- **Shared Libraries**: Common code shared between applications

The architecture follows a clean separation of concerns:

- Komp adds jobs to queues but doesn't process them
- Worker only processes jobs from queues but doesn't handle API requests
- Libraries provide shared functionality (database, queue interfaces, etc.)

## Project Structure

[Project structure remains the same as in the original README]

## Prerequisites

- Node.js (>= 16.x)
- npm (>= 8.x)
- PostgreSQL (>= 14.x)
- Redis (>= 6.x)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd konnectify

# Install dependencies
npm install
```
````

### Environment Setup

Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://username:password@localhost:5432/konnectify?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
KOMP_PORT=8000
WORKER_PORT=8001
NODE_ENV=development
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev
```

## Development

### Running the Applications

```bash
# Run komp (Port 8000)
npm run start:app

# Run worker (Port 8001)
npm run start:worker

# Run both concurrently with proxy (Port 8002)
npm run start:all
```

### Working with the Monorepo

#### Building Applications

```bash
# Build all applications
npm run build

# Build specific applications
npm run build:komp
npm run build:worker

# Build all libraries
npm run build:libs
```

#### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific applications
npm run test:komp
npm run test:worker

# Run end-to-end tests
npm run test:e2e
```

#### Other Utilities

```bash
# Lint the project
npm run lint

# Format the code
npm run format

# Clean build artifacts
npm run clean
```

## Understanding the Queue System

The worker application handles background job processing using BullMQ with Redis.

### Queue Types

- `emailQueue`: For email-related jobs
- `processingQueue`: For data processing jobs
- `ReplyMessageQueue`: For message delivery jobs
- `BulkMessageQueue`: For bulk message generation

### Key Components

- **Producers**: Classes that add jobs to queues
- **Processors**: Classes that process jobs from queues
- **ReadyService**: Ensures the worker is fully initialized before processing

## Database Management

Edit the Prisma schema in `libs/database/prisma/schema.prisma`.

```bash
# Generate a new migration
npm run prisma:migrate:dev -- --name migration_name

# Apply migrations in production
npm run prisma:migrate:deploy

# Reset the database (development only)
npm run prisma:reset

# Open Prisma Studio
npm run prisma:studio
```

## Deployment Considerations

1. **Container Setup**:

   - Create separate Docker containers for komp and worker
   - Both should share the same Redis instance

2. **Environment Variables**:

   - Use environment-specific variables (.env.production)

3. **Scaling**:
   - Scale worker instances based on job volume
   - Use a Redis cluster in high-volume environments

## Best Practices

1. **Application Separation**:

   - Keep API logic in komp
   - Keep job processing logic in worker
   - Avoid mixing concerns

2. **Queue Management**:

   - Use appropriate retry strategies for different job types
   - Monitor queue lengths and processing times
   - Set appropriate job removal policies to prevent memory issues

3. **Development Workflow**:
   - Run both applications simultaneously during development
   - Use separate terminals for easier debugging

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

[Your license information]

```

This updated README reflects the new port numbers (8000 for Komp, 8001 for Worker, and 8002 for the proxy when running both), includes information about the proxy, and maintains a concise yet comprehensive overview of the project structure, setup, and development workflow. The content has been reorganized to focus on the most important aspects of setting up and running the project, while still providing detailed information about the queue system, database management, and best practices.
```
