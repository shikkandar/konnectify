import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ReadyService } from '../common/queue/ready.service';

async function bootstrap() {
  const logger = new Logger('Worker');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('WORKER_PORT', 8001);

  await app.listen(port);
  logger.log(`Worker service is running on port ${port}`);

  // Mark application as ready to process jobs
  const readyService = app.get(ReadyService);
  readyService.markAsReady();

  logger.log('Worker is ready to process jobs');
}
bootstrap();
