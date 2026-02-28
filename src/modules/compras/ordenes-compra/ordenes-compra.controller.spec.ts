import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesCompraController } from './ordenes-compra.controller';

describe('OrdenesCompraController', () => {
  let controller: OrdenesCompraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdenesCompraController],
    }).compile();

    controller = module.get<OrdenesCompraController>(OrdenesCompraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
