import { Controller, Get, Query } from '@nestjs/common';
import { DepartamentosService } from '../departamentos/departamentos.service';
import { ListDepartamentoQueryDto } from './dto/list-departamento.query.dto';

@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly service: DepartamentosService) {}

  @Get()
  findAll(@Query() query: ListDepartamentoQueryDto) {
    return this.service.findAll(query);
  }
}