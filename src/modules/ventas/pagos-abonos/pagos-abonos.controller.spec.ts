import { Test, TestingModule } from '@nestjs/testing';
import { PagosAbonosController } from './pagos-abonos.controller';

describe('PagosAbonosController', () => {
  let controller: PagosAbonosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosAbonosController],
    }).compile();

    controller = module.get<PagosAbonosController>(PagosAbonosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
