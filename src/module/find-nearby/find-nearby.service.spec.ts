import { Test, TestingModule } from '@nestjs/testing';
import { FindNearbyService } from './find-nearby.service';

describe('FindNearbyService', () => {
  let service: FindNearbyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FindNearbyService],
    }).compile();

    service = module.get<FindNearbyService>(FindNearbyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
