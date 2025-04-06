import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkerModule } from './queue/worker.module';
import { DatabaseModule } from 'db/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    WorkerModule.register(),
  ],
})
export class AppModule {}
