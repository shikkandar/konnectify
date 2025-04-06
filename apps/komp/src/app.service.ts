import { Injectable } from '@nestjs/common';

@Injectable()
export class KompService {
  getHello(): string {
    return 'Hello World!';
  }
}
