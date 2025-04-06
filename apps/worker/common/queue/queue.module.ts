import { Module, Global } from '@nestjs/common';
import { ReadyService } from './ready.service';

@Global()
@Module({
  providers: [ReadyService],
  exports: [ReadyService],
})
export class CommonQueueModule {}
