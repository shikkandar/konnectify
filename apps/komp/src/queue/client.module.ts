import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProducerService } from 'apps/worker/src/producers/email.producer';

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
      { name: 'emailQueue' },
      { name: 'processingQueue' },
      { name: 'ReplyMessageQueue' },
    ),
  ],
  providers: [EmailProducerService],
  exports: [EmailProducerService],
})
export class ClientModule {}
