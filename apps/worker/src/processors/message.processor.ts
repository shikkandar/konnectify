import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReadyService } from 'apps/worker/common/queue/ready.service';
import { BaseProcessor } from '../../common/base/base.processor';

@Processor('ReplyMessageQueue')
export class MessageProcessor extends BaseProcessor {
  constructor(readyService: ReadyService) {
    super(readyService);
  }

  async process(job: Job): Promise<any> {
    await this.ensureApplicationReady(job.id ?? '');

    this.logger.debug(`Processing message job ${job.id}`);
    const { name, productName, amount } = job.data;

    this.logger.log(
      `Sending message to: ${name} about product: ${productName} with amount: ${amount}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    this.logger.debug(`Message job ${job.id} completed`);
    return { success: true, jobId: job.id, sentAt: new Date().toISOString() };
  }
}
