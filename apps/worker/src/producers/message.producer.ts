import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export interface ReplyMessageJobData {
  name: string;
  productName: string;
  amount: number;
}

@Injectable()
export class MessageProducerService {
  private readonly logger = new Logger(MessageProducerService.name);

  constructor(
    @InjectQueue('ReplyMessageQueue') private readonly replyMessageQueue: Queue,
    @InjectQueue('BulkMessageQueue') private readonly bulkMessageQueue: Queue,
  ) {}

  async addToReplyMessageQueue(data: ReplyMessageJobData, opts?: any) {
    this.logger.log(
      `Adding job to reply message queue with data: ${JSON.stringify({
        name: data.name,
        productName: data.productName,
        amount: data.amount,
      })}`,
    );

    const job = await this.replyMessageQueue.add('send-reply-message', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      ...opts,
    });

    this.logger.log(`Job ${job.id} added to reply message queue`);
    return job;
  }

  async addBulkMessages(
    messageCount: number,
    template: Partial<ReplyMessageJobData> = {},
  ) {
    this.logger.log(`Adding bulk job to process ${messageCount} messages`);

    const job = await this.bulkMessageQueue.add(
      'process-bulk-messages',
      {
        count: messageCount,
        template,
      },
      {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 10000,
        },
        removeOnComplete: 50,
      },
    );

    this.logger.log(`Bulk job ${job.id} added to queue`);
    return job;
  }
}
