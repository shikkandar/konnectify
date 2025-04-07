import { Module, Global, DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonQueueModule } from 'apps/worker/common/queue/queue.module';
import { MessageProcessor } from '../processors/message.processor';
import { BulkMessageProcessor } from '../processors/bulk-message.processor';
import { MessageProducerService } from '../producers/message.producer';

@Global()
@Module({})
export class WorkerModule {
  static register(): DynamicModule {
    return {
      module: WorkerModule,
      imports: [
        CommonQueueModule,
        ConfigModule.forRoot(),
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            connection: {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: parseInt(configService.get('REDIS_PORT', '6379')),
              password: configService.get('REDIS_PASSWORD', ''),
            },
            prefix: 'app_queue_',
            defaultJobOptions: {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
              removeOnComplete: 100,
              removeOnFail: 200,
            },
          }),
        }),
        BullModule.registerQueue(
          { name: 'emailQueue' },
          { name: 'processingQueue' },
          { name: 'ReplyMessageQueue' },
          { name: 'BulkMessageQueue' },
        ),
      ],
      providers: [
        MessageProducerService,
        MessageProcessor,
        BulkMessageProcessor,
      ],
      exports: [MessageProducerService],
    };
  }
}
