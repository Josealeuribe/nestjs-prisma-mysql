import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesVentaController } from './ordenes-venta.controller';

describe('OrdenesVentaController', () => {
  let controller: OrdenesVentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdenesVentaController],
    }).compile();

    controller = module.get<OrdenesVentaController>(OrdenesVentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
