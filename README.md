# Konnectify

A scalable NestJS monorepo application with a main API service (komp) and background worker for job processing.

## Project Overview

Konnectify is built on a monorepo architecture, consisting of:

- **Komp**: Main API application that handles client requests
- **Worker**: Background processing service that handles queued jobs
- **Shared Libraries**: Common code shared between applications

The architecture follows a clean separation of concerns:

- Komp adds jobs to queues but doesn't process them
- Worker only processes jobs from queues but doesn't handle API requests
- Libraries provide shared functionality (database, queue interfaces, etc.)

## Project Structure

```
konnectify/
├── apps/
│   ├── komp/              # Main API application
│   │   ├── src/
│   │   │   ├── komp.module.ts
│   │   │   ├── komp.controller.ts
│   │   │   ├── komp.service.ts
│   │   │   ├── main.ts
│   │   │   └── queue/
│   │   │       └── queue.module.ts
│   │   └── tsconfig.app.json
│   └── worker/            # Background worker service
│       ├── src/
│       │   ├── worker.module.ts
│       │   ├── main.ts
│       │   ├── common/
│       │   │   ├── queue/
│       │   │   │   ├── ready.service.ts
│       │   │   │   └── queue.module.ts
│       │   │   └── processors/
│       │   │       └── base.processor.ts
│       │   ├── processors/
│       │   │   ├── email.processor.ts
│       │   │   ├── message.processor.ts
│       │   │   └── data.processor.ts
│       │   ├── producers/
│       │   │   ├── email.producer.ts
│       │   │   └── message.producer.ts
│       │   └── queue/
│       │       └── worker.module.ts
│       └── tsconfig.app.json
├── libs/
│   ├── common/            # Shared utilities
│   │   └── src/
│   ├── database/          # Database library with Prisma
│   │   ├── src/
│   │   │   ├── database.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── index.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── tsconfig.lib.json
│   └── queue-shared/      # Shared queue interfaces
│       ├── src/
│       │   ├── interfaces.ts
│       │   └── index.ts
│       └── tsconfig.lib.json
├── nest-cli.json
├── .env                   # Environment variables
├── package.json
└── tsconfig.json
```

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

### Environment Setup

Create a `.env` file in the project root:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/konnectify?schema=public"

# Redis (for queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Ports
KOMP_PORT=3000
WORKER_PORT=3001

# Other Configuration
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
# Run komp in development mode
npm run start:komp:dev

# Run worker in development mode
npm run start:worker:dev

# Run both concurrently (requires concurrently package)
npm run start:dev
```

### Running Projects in a Monorepo

In a NestJS monorepo, each application and library is treated as a separate project. Here's how to work with different projects:

#### Running Specific Applications

```bash
# Run a specific application by name
nest start komp
nest start worker

# Run with watch mode
nest start komp --watch
nest start worker --watch

# Run with debug mode
nest start komp --debug --watch
```

#### Building Specific Applications

```bash
# Build a specific application
nest build komp
nest build worker

# Build all applications
nest build
```

#### Targeting Specific Applications with npm Scripts

You can use npm scripts to target specific applications:

```bash
# For example, to run tests for a specific application
npm run test:komp
npm run test:worker

# Or to lint a specific application
npm run lint:komp
```

#### Working with Libraries

Libraries don't run independently but are imported by applications. After making changes to a library:

```bash
# Build the library
nest build database
nest build queue-shared

# Or build all libraries
npm run build:libs
```

#### Using NestJS CLI with Projects

```bash
# Generate components within a specific project
nest generate controller new-feature --project=komp
nest generate service new-service --project=worker
nest generate module auth --project=komp

# Generate a component in a library
nest generate class new-entity --project=database
```

## Understanding the Queue System

The worker application handles background job processing using BullMQ with Redis.

### Queue Structure

1. **Queue Types**:

   - `emailQueue`: For email-related jobs
   - `processingQueue`: For data processing jobs
   - `ReplyMessageQueue`: For message delivery jobs
   - `BulkMessageQueue`: For bulk message generation

2. **Job Processing Flow**:

   - The komp application adds jobs to queues
   - The worker application processes jobs from queues
   - If the worker is restarted, it continues processing pending jobs

3. **Key Components**:
   - **Producers**: Classes that add jobs to queues
   - **Processors**: Classes that process jobs from queues
   - **ReadyService**: Ensures the worker is fully initialized before processing

### Creating a New Queue

To add a new queue type:

1. Add the queue in `apps/worker/src/queue/worker.module.ts`:

   ```typescript
   BullModule.registerQueue(
     { name: 'emailQueue' },
     { name: 'processingQueue' },
     { name: 'ReplyMessageQueue' },
     { name: 'newQueueName' }, // Add your new queue here
   );
   ```

2. Create a producer service in `apps/worker/src/producers/`:

   ```typescript
   @Injectable()
   export class NewProducerService {
     constructor(
       @InjectQueue('newQueueName') private readonly newQueue: Queue,
     ) {}

     async addToQueue(data: any) {
       return this.newQueue.add('job-name', data);
     }
   }
   ```

3. Create a processor in `apps/worker/src/processors/`:

   ```typescript
   @Processor('newQueueName')
   export class NewProcessor extends BaseProcessor {
     constructor(readyService: ReadyService) {
       super(readyService);
     }

     async process(job: Job) {
       await this.ensureApplicationReady(job.id ?? '');
       // Process the job
       return { success: true };
     }
   }
   ```

4. Register the producer and processor in worker.module.ts:

   ```typescript
   providers: [
     // existing providers...
     NewProducerService,
     NewProcessor,
   ],
   exports: [
     // existing exports...
     NewProducerService,
   ],
   ```

5. Update the komp application's queue module to register the new queue

## Creating New Applications and Libraries

### Creating a New Application

```bash
# Create a new application
nest generate app new-app-name
```

Update the nest-cli.json to include the new application.

### Creating a New Library

```bash
# Create a new library
nest generate library new-lib-name
```

Update tsconfig.json with the appropriate path mappings.

## Database Management

### Models and Migrations

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

## Available Scripts

```bash
# Build applications
npm run build               # Build all applications
npm run build:komp         # Build only komp
npm run build:worker       # Build only worker
npm run build:libs        # Build all libraries

# Development
npm run start:komp:dev     # Run komp in watch mode
npm run start:worker:dev   # Run worker in watch mode
npm run start:dev         # Run both apps concurrently

# Production
npm run start:komp:prod    # Run komp in production mode
npm run start:worker:prod  # Run worker in production mode

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate:dev # Create and apply migrations
npm run prisma:studio      # Open Prisma database GUI
npm run prisma:reset       # Reset database (delete all data)

# Testing
npm run test               # Run all tests
npm run test:komp         # Run komp tests
npm run test:worker       # Run worker tests
npm run test:e2e          # Run end-to-end tests
npm run test:cov          # Generate test coverage

# Utilities
npm run lint              # Lint all projects
npm run format            # Format code with Prettier
npm run clean             # Clean build artifacts
```

### Additional Scripts for package.json

For a complete monorepo setup, consider adding these scripts to your package.json:

```json
"scripts": {
  "build": "nest build",
  "build:komp": "nest build komp",
  "build:worker": "nest build worker",
  "build:libs": "nest build database && nest build queue-shared && nest build common",
  "format": "prettier --write \"apps/**/*.ts\" \"libs/**/*.ts\"",
  "start:dev": "concurrently \"npm run start:komp:dev\" \"npm run start:worker:dev\"",
  "start:komp:dev": "nest start komp --watch",
  "start:worker:dev": "nest start worker --watch",
  "start:komp:debug": "nest start komp --debug --watch",
  "start:worker:debug": "nest start worker --debug --watch",
  "start:komp:prod": "node dist/apps/komp/main",
  "start:worker:prod": "node dist/apps/worker/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
  "lint:fix": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:komp": "jest --projects apps/komp",
  "test:worker": "jest --projects apps/worker",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./apps/komp/test/jest-e2e.json",
  "clean": "rimraf dist",
  "prestart:prod": "npm run build",
  "postinstall": "npm run prisma:generate"
}
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
