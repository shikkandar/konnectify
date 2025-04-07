import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageProducerService } from '../../../../worker/src/producers/message.producer';

@Module({
  imports: [
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
      }),
    }),
    BullModule.registerQueue(
      { name: 'ReplyMessageQueue' },
      { name: 'BulkMessageQueue' },
    ),
  ],
  providers: [MessageProducerService],
  exports: [MessageProducerService],
})
export class QueueModule {}
