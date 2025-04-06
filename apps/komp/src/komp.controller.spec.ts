import { Test, TestingModule } from '@nestjs/testing';
import { KompController } from './komp.controller';
import { KompService } from './app.service';

describe('KompController', () => {
  let kompController: KompController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [KompController],
      providers: [KompService],
    }).compile();

    kompController = app.get<KompController>(KompController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(kompController.getHello()).toBe('Hello World!');
    });
  });
});
