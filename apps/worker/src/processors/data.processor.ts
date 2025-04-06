import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ReadyService } from 'apps/worker/common/queue/ready.service';

@Processor('processingQueue')
export class DataProcessor extends WorkerHost {
  private readonly logger = new Logger(DataProcessor.name);

  constructor(private readonly readyService: ReadyService) {
    super();
  }

  async process(job: Job): Promise<any> {
    // Ensure application is ready before processing
    await this.ensureApplicationReady(job.id ?? '');

    this.logger.debug(`Processing job ${job.id} with data:`, job.data);

    // Simulate data processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.debug(`Data processing job ${job.id} completed`);
    return {
      success: true,
      jobId: job.id,
      processedData: job.data,
    };
  }

  private async ensureApplicationReady(jobId: string): Promise<void> {
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
