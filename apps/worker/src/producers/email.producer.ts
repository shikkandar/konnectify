import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
}

export interface ProcessingJobData {
  orgId: string;
  projectId?: string;
  data: any;
  options?: {
    priority?: number;
    notifyOnComplete?: boolean;
  };
}

@Injectable()
export class EmailProducerService {
  private readonly logger = new Logger(EmailProducerService.name);

  constructor(
    @InjectQueue('emailQueue') private readonly emailQueue: Queue,
    @InjectQueue('processingQueue') private readonly processingQueue: Queue,
    @InjectQueue('ReplyMessageQueue') private readonly ReplyMessageQueue: Queue,
  ) {}

  async addToEmailQueue(data: EmailJobData, opts?: any) {
    this.logger.log(
      `Adding job to email queue with data: ${JSON.stringify(data)}`,
    );
    const job = await this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      ...opts,
    });
    this.logger.log(`Job ${job.id} added to email queue`);
    return job;
  }

  async addToProcessingQueue(data: ProcessingJobData, opts?: any) {
    this.logger.log(
      `Adding job to processing queue with data: ${JSON.stringify({
        orgId: data.orgId,
        projectId: data.projectId,
      })}`,
    );

    const job = await this.processingQueue.add('process-data', data, {
      priority: data.options?.priority || 5,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 10000,
      },
      removeOnComplete: 100,
      ...opts,
    });

    this.logger.log(`Job ${job.id} added to processing queue`);
    return job;
  }
}
