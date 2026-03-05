import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ProveedoresService,
  ProveedoresFindAllResponse,
  ProveedorPayload,
} from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ListProveedorQueryDto } from './dto/list-proveedor.query.dto';

@Controller('proveedor')
export class ProveedoresController {
  constructor(private readonly service: ProveedoresService) {}

  @Post()
  create(@Body() dto: CreateProveedorDto): Promise<ProveedorPayload> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query() query: ListProveedorQueryDto,
  ): Promise<ProveedoresFindAllResponse> {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeRefs') includeRefs?: 'true' | 'false',
  ) {
    return this.service.findOne(id, includeRefs !== 'false');
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateProveedorDto,
  ): Promise<ProveedorPayload> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  disable(@Param('id', ParseIntPipe) id: number): Promise<ProveedorPayload> {
    return this.service.disable(id);
  }

  @Patch(':id/enable')
  enable(@Param('id', ParseIntPipe) id: number): Promise<ProveedorPayload> {
    return this.service.enable(id);
  }
}
