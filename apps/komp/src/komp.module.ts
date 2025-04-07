import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessageController } from './modules/message/message.controller';
import { QueueModule } from './modules/queue/queue.module';
import { DatabaseModule } from '@db/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    QueueModule,
  ],
  controllers: [MessageController],
})
export class KompModule {}
