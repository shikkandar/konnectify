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

