import { Test, TestingModule } from '@nestjs/testing';
import { BodegaUsuarioService } from './bodega-usuario.service';

describe('BodegaUsuarioService', () => {
  let service: BodegaUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BodegaUsuarioService],
    }).compile();

    service = module.get<BodegaUsuarioService>(BodegaUsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
