import { Module } from '@nestjs/common';
import { KompController } from './komp.controller';
import { KompService } from './app.service';
import { DatabaseModule } from 'db/database';
import { ClientModule } from './queue/client.module';

@Module({
  imports: [DatabaseModule, ClientModule],
  controllers: [KompController],
  providers: [KompService],
})
export class KompModule {}
