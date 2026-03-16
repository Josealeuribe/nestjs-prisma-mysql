import { Controller, Get, Query } from '@nestjs/common';
import { MunicipiosService } from './municipios.service';
import { ListMunicipioQueryDto } from './dto/list-municipio.query.dto';

@Controller('municipios')
export class MunicipiosController {
  constructor(private readonly service: MunicipiosService) {}

  @Get()
  findAll(@Query() query: ListMunicipioQueryDto) {
    return this.service.findAll(query);
  }
}