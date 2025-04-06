import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ReadyService } from 'apps/worker/common/queue/ready.service';

@Processor('emailQueue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly readyService: ReadyService) {
    super();
  }

  async process(job: Job): Promise<any> {
    // Ensure application is ready before processing
    await this.ensureApplicationReady(job.id ?? '');

    this.logger.debug('Start processing email job...');
    this.logger.debug(`Processing job ${job.id} with data:`, job.data);

    try {
      // Simulate email sending or implement actual email sending logic
      this.logger.log(`Sending email to: ${job.data.to}`);
      this.logger.log(`Subject: ${job.data.subject}`);

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.debug(`Email job ${job.id} completed successfully`);
      return {
        success: true,
        jobId: job.id,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed: ${error.message}`);
      throw error;
    }
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
