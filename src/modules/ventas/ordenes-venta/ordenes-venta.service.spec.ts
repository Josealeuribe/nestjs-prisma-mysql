import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesVentaService } from './ordenes-venta.service';

describe('OrdenesVentaService', () => {
  let service: OrdenesVentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdenesVentaService],
    }).compile();

    service = module.get<OrdenesVentaService>(OrdenesVentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
