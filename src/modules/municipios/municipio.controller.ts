import { Controller, Get, Query } from '@nestjs/common';
import { MunicipioService } from './municipio.service';

@Controller('municipio')
export class MunicipioController {
  constructor(private readonly service: MunicipioService) {}

  @Get()
  findAll(@Query('includeRefs') includeRefs?: 'true' | 'false') {
    return this.service.findAll(includeRefs === 'true');
  }
}
