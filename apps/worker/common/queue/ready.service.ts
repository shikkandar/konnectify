import { Injectable } from '@nestjs/common';

@Injectable()
export class ReadyService {
  checkReadiness() {
      throw new Error('Method not implemented.');
  }
  private isReady = false;

  markAsReady() {
    this.isReady = true;
  }

  isApplicationReady(): boolean {
    return this.isReady;
  }

  async waitUntilReady(maxWaitTime = 60000): Promise<void> {
    if (this.isReady) return;

    const startTime = Date.now();

    while (!this.isReady) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error(
          'Application failed to become ready in the allowed time',
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
