import { Processor, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { ReplyMessageJobData } from '../producers/message.producer';
import { ReadyService } from 'apps/worker/common/queue/ready.service';
import { BaseProcessor } from '../../common/base/base.processor';

interface MessageJobResult {
  id: string | undefined;
  data: ReplyMessageJobData;
}

@Processor('BulkMessageQueue')
export class BulkMessageProcessor extends BaseProcessor {
  constructor(
    readyService: ReadyService,
    @InjectQueue('ReplyMessageQueue') private readonly replyMessageQueue: Queue,
  ) {
    super(readyService);
  }

  async process(job: Job): Promise<any> {
    await this.ensureApplicationReady(job.id ?? '');

    const { count, template } = job.data;
    this.logger.log(`Starting to process bulk job of ${count} messages`);

    const results: MessageJobResult[] = [];

    for (let i = 0; i < count; i++) {
      const messageData: ReplyMessageJobData = {
        name: template?.name || `User${i + 1}`,
        productName:
          template?.productName ||
          `Product${Math.floor(Math.random() * 10) + 1}`,
        amount:
          template?.amount || parseFloat((Math.random() * 100 + 10).toFixed(2)),
      };

      const messageJob = await this.replyMessageQueue.add(
        'send-reply-message',
        messageData,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
        },
      );

      results.push({ id: messageJob.id, data: messageData });

      if (i % 100 === 0 && i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    this.logger.log(
      `Bulk job ${job.id} completed, added ${results.length} messages to queue`,
    );
    return {
      success: true,
      jobId: job.id,
      totalMessages: count,
      messageJobsCreated: results.length,
    };
  }
}
