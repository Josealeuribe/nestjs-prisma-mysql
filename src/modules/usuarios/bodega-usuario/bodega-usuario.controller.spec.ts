import { Test, TestingModule } from '@nestjs/testing';
import { BodegaUsuarioController } from './bodega-usuario.controller';

describe('BodegaUsuarioController', () => {
  let controller: BodegaUsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BodegaUsuarioController],
    }).compile();

    controller = module.get<BodegaUsuarioController>(BodegaUsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
