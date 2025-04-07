import { WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ReadyService } from 'apps/worker/common/queue/ready.service';

export abstract class BaseProcessor extends WorkerHost {
  protected readonly logger: Logger;

  constructor(private readonly readyService: ReadyService) {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  protected async ensureApplicationReady(jobId: string): Promise<void> {
    try {
      if (!this.readyService.isApplicationReady()) {
        this.logger.log(`Job ${jobId} waiting for application to be ready...`);
        await this.readyService.waitUntilReady();
        this.logger.log(`Job ${jobId} continuing after application is ready`);
      }
    } catch (error) {
      this.logger.error(
        `Job ${jobId} failed while waiting for application to be ready: ${error.message}`,
      );
      throw error;
    }
  }
}
