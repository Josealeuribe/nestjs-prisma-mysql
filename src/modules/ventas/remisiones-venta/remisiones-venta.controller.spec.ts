import { Test, TestingModule } from '@nestjs/testing';
import { RemisionesVentaController } from './remisiones-venta.controller';

describe('RemisionesVentaController', () => {
  let controller: RemisionesVentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemisionesVentaController],
    }).compile();

    controller = module.get<RemisionesVentaController>(
      RemisionesVentaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
