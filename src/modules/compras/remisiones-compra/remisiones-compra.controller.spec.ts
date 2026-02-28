import { Test, TestingModule } from '@nestjs/testing';
import { RemisionesCompraController } from './remisiones-compra.controller';

describe('RemisionesCompraController', () => {
  let controller: RemisionesCompraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemisionesCompraController],
    }).compile();

    controller = module.get<RemisionesCompraController>(RemisionesCompraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
