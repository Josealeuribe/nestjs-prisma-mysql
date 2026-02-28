import { Test, TestingModule } from '@nestjs/testing';
import { RemisionesVentaService } from './remisiones-venta.service';

describe('RemisionesVentaService', () => {
  let service: RemisionesVentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemisionesVentaService],
    }).compile();

    service = module.get<RemisionesVentaService>(RemisionesVentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
