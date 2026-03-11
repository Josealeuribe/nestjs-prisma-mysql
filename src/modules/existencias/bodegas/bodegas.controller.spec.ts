import { Test, TestingModule } from '@nestjs/testing';
import { BodegaController } from './bodega/bodegas.controller';

describe('BodegasController', () => {
  let controller: BodegaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BodegaController],
    }).compile();

    controller = module.get<BodegaController>(BodegaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
