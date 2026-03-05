import { Test, TestingModule } from '@nestjs/testing';
import { BodegaService } from './bodegas.service';

describe('BodegasService', () => {
  let service: BodegaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BodegaService],
    }).compile();

    service = module.get<BodegaService>(BodegaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
