import { Body, Controller, Post } from '@nestjs/common';
import {
  MessageProducerService,
  ReplyMessageJobData,
} from 'apps/worker/src/producers/message.producer';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

interface BulkMessageRequest {
  count: number;
  template?: Partial<ReplyMessageJobData>;
}

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageProducerService: MessageProducerService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a single message to the queue' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'productName', 'amount'],
      properties: {
        name: {
          type: 'string',
          example: 'John Doe',
          description: 'The name of the recipient',
        },
        productName: {
          type: 'string',
          example: 'Premium Subscription',
          description: 'The name of the product',
        },
        amount: {
          type: 'number',
          example: 99.99,
          description: 'The amount associated with the message',
        },
      },
    },
    examples: {
      example1: {
        summary: 'Basic message',
        description: 'A basic message with minimal information',
        value: {
          name: 'John Doe',
          productName: 'Basic Plan',
          amount: 19.99,
        },
      },
      example2: {
        summary: 'Premium message',
        description: 'A message for premium product',
        value: {
          name: 'Jane Smith',
          productName: 'Premium Plan',
          amount: 99.99,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message successfully added to queue',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        jobId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        message: {
          type: 'string',
          example: 'Message added to queue',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to add message to queue',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        message: {
          type: 'string',
          example: 'Failed to connect to Redis',
        },
      },
    },
  })
  async sendMessage(@Body() data: ReplyMessageJobData) {
    try {
      const job =
        await this.messageProducerService.addToReplyMessageQueue(data);
      return {
        success: true,
        jobId: job.id,
        message: 'Message added to queue',
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send multiple messages in bulk' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['count'],
      properties: {
        count: {
          type: 'number',
          example: 100,
          description: 'Number of messages to generate',
        },
        template: {
          type: 'object',
          description: 'Optional template for generated messages',
          properties: {
            name: {
              type: 'string',
              example: 'User',
              description:
                'Template name prefix (will be appended with number)',
            },
            productName: {
              type: 'string',
              example: 'Product',
              description:
                'Template product name (will be appended with number)',
            },
            amount: {
              type: 'number',
              example: 50,
              description:
                'Fixed amount (if not provided, random amount will be generated)',
            },
          },
        },
      },
    },
    examples: {
      smallBatch: {
        summary: 'Small batch',
        description: 'Process a small batch of messages',
        value: {
          count: 10,
          template: {
            productName: 'Test Product',
          },
        },
      },
      largeBatch: {
        summary: 'Large batch',
        description: 'Process a large batch of messages',
        value: {
          count: 1000,
        },
      },
      customBatch: {
        summary: 'Custom template',
        description: 'Process messages with a custom template',
        value: {
          count: 50,
          template: {
            name: 'Customer',
            productName: 'Enterprise Plan',
            amount: 299.99,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk job successfully added to queue',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        jobId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        message: {
          type: 'string',
          example: 'Bulk job to process 100 messages added to queue',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to add bulk job to queue',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        message: {
          type: 'string',
          example: 'Failed to connect to Redis',
        },
      },
    },
  })
  async sendBulkMessages(@Body() request: BulkMessageRequest) {
    try {
      const job = await this.messageProducerService.addBulkMessages(
        request.count,
        request.template,
      );

      return {
        success: true,
        jobId: job.id,
        message: `Bulk job to process ${request.count} messages added to queue`,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
