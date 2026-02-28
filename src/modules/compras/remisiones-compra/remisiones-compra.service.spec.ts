import { Test, TestingModule } from '@nestjs/testing';
import { RemisionesCompraService } from './remisiones-compra.service';

describe('RemisionesCompraService', () => {
  let service: RemisionesCompraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemisionesCompraService],
    }).compile();

    service = module.get<RemisionesCompraService>(RemisionesCompraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
