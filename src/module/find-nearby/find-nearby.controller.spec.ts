import { Test, TestingModule } from '@nestjs/testing';
import { FindNearbyController } from './find-nearby.controller';
import { FindNearbyService } from './find-nearby.service';

describe('FindNearbyController', () => {
  let controller: FindNearbyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindNearbyController],
      providers: [FindNearbyService],
    }).compile();

    controller = module.get<FindNearbyController>(FindNearbyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
