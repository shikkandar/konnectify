import { Logger } from '@nestjs/common';
import { ReadyService } from 'apps/worker/common/queue/ready.service';

export abstract class BaseProcessor {
  protected logger: Logger;

  constructor(protected readonly readyService: ReadyService) {
    // Use the child class name for the logger
    this.logger = new Logger(this.constructor.name);
  }

  protected async ensureApplicationReady(
    jobId: string | number,
  ): Promise<void> {
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

  // Abstract method to be implemented by child classes
  abstract process(job: any): Promise<any>;
}
