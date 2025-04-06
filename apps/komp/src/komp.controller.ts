import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { KompService } from './app.service';
import { EmailProducerService } from '../../worker/src/producers/email.producer';
import {
  EmailJobData,
  ProcessingJobData,
} from '../../worker/src/producers/email.producer';

@ApiTags('Komp')
@Controller()
export class KompController {
  constructor(
    private readonly kompService: KompService,
    private readonly emailProducer: EmailProducerService,
  ) {}

  @Post('send-email')
  @ApiOperation({ summary: 'Send an email via queue' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
        attachments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
      },
      example: {
        to: 'recipient@example.com',
        subject: 'Welcome',
        body: 'Hello, welcome to our platform!',
        attachments: [
          {
            filename: 'welcome.pdf',
            content: 'base64encodedcontent',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Email job successfully created',
    schema: {
      example: {
        success: true,
        jobId: 'unique-job-id',
      },
    },
  })
  async sendEmail(@Body() emailData: EmailJobData) {
    const job = await this.emailProducer.addToEmailQueue(emailData);
    return { success: true, jobId: job.id };
  }

  @Post('process-data')
  @ApiOperation({ summary: 'Process data via queue' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orgId: { type: 'string' },
        projectId: { type: 'string' },
        data: { type: 'object' },
        options: {
          type: 'object',
          properties: {
            priority: { type: 'number' },
            notifyOnComplete: { type: 'boolean' },
          },
        },
      },
      example: {
        orgId: 'org-123',
        projectId: 'project-456',
        data: {
          key: 'value',
          additionalInfo: 'Processing details',
        },
        options: {
          priority: 5,
          notifyOnComplete: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Data processing job successfully created',
    schema: {
      example: {
        success: true,
        jobId: 'unique-job-id',
      },
    },
  })
  async processData(@Body() processingData: ProcessingJobData) {
    const job = await this.emailProducer.addToProcessingQueue(processingData);
    return { success: true, jobId: job.id };
  }
}
