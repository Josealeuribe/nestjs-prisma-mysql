import { Test, TestingModule } from '@nestjs/testing';
import { PagosAbonosService } from './pagos-abonos.service';

describe('PagosAbonosService', () => {
  let service: PagosAbonosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosAbonosService],
    }).compile();

    service = module.get<PagosAbonosService>(PagosAbonosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
