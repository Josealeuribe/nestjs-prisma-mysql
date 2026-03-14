import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cliente.findMany({
      include: {
        tipo_cliente: true,
        municipios: true,
        tipo_documento: true,
      },
      orderBy: { id_cliente: 'desc' },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id_cliente: id },
      include: {
        tipo_cliente: true,
        municipios: true,
        tipo_documento: true,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no existe');
    }

    return cliente;
  }

  async create(dto: CreateClienteDto) {
    const tipoCliente = await this.prisma.tipo_cliente.findUnique({
      where: { id_tipo_cliente: dto.id_tipo_cliente },
    });
    if (!tipoCliente) {
      throw new NotFoundException('Tipo de cliente inválido');
    }

    const municipio = await this.prisma.municipios.findUnique({
      where: { id_municipio: dto.id_municipio },
    });
    if (!municipio) {
      throw new NotFoundException('Municipio inválido');
    }

    const tipoDoc = await this.prisma.tipo_documento.findUnique({
      where: { id_tipo_doc: dto.id_tipo_doc },
    });
    if (!tipoDoc) {
      throw new NotFoundException('Tipo de documento inválido');
    }

    const existeDocumento = await this.prisma.cliente.findUnique({
      where: { num_documento: dto.num_documento },
    });

    if (existeDocumento) {
      throw new BadRequestException(
        'Ya existe un cliente con ese número de documento',
      );
    }

    if (dto.email) {
      const existeEmail = await this.prisma.cliente.findUnique({
        where: { email: dto.email },
      });

      if (existeEmail) {
        throw new BadRequestException('Ya existe un cliente con ese email');
      }
    }

    const clienteCreado = await this.prisma.cliente.create({
      data: {
        nombre_cliente: dto.nombre_cliente,
        email: dto.email ?? null,
        telefono: dto.telefono ?? null,
        direccion: dto.direccion ?? null,
        num_documento: dto.num_documento,
        id_tipo_cliente: dto.id_tipo_cliente,
        id_municipio: dto.id_municipio,
        id_tipo_doc: dto.id_tipo_doc,
        estado: dto.estado ?? true,
      },
    });

    const clienteActualizado = await this.prisma.cliente.update({
      where: { id_cliente: clienteCreado.id_cliente },
      data: {
        codigo_cliente: `CLI-${String(clienteCreado.id_cliente).padStart(4, '0')}`,
      },
      include: {
        tipo_cliente: true,
        municipios: true,
        tipo_documento: true,
      },
    });

    return clienteActualizado;
  }

  async update(id: number, dto: UpdateClienteDto) {
    const existeCliente = await this.prisma.cliente.findUnique({
      where: { id_cliente: id },
      select: { id_cliente: true },
    });

    if (!existeCliente) {
      throw new NotFoundException('Cliente no existe');
    }

    if (dto.id_tipo_cliente) {
      const tipoCliente = await this.prisma.tipo_cliente.findUnique({
        where: { id_tipo_cliente: dto.id_tipo_cliente },
      });

      if (!tipoCliente) {
        throw new NotFoundException('Tipo de cliente inválido');
      }
    }

    if (dto.id_municipio) {
      const municipio = await this.prisma.municipios.findUnique({
        where: { id_municipio: dto.id_municipio },
      });

      if (!municipio) {
        throw new NotFoundException('Municipio inválido');
      }
    }

    if (dto.id_tipo_doc) {
      const tipoDoc = await this.prisma.tipo_documento.findUnique({
        where: { id_tipo_doc: dto.id_tipo_doc },
      });

      if (!tipoDoc) {
        throw new NotFoundException('Tipo de documento inválido');
      }
    }

    if (dto.num_documento) {
      const documentoDuplicado = await this.prisma.cliente.findFirst({
        where: {
          num_documento: dto.num_documento,
          NOT: { id_cliente: id },
        },
        select: { id_cliente: true },
      });

      if (documentoDuplicado) {
        throw new BadRequestException(
          'Ya existe otro cliente con ese número de documento',
        );
      }
    }

    if (dto.email) {
      const emailDuplicado = await this.prisma.cliente.findFirst({
        where: {
          email: dto.email,
          NOT: { id_cliente: id },
        },
        select: { id_cliente: true },
      });

      if (emailDuplicado) {
        throw new BadRequestException('Ya existe otro cliente con ese email');
      }
    }

    const data: Prisma.clienteUpdateInput = {
      ...(dto.nombre_cliente !== undefined && {
        nombre_cliente: dto.nombre_cliente,
      }),
      ...(dto.email !== undefined && { email: dto.email || null }),
      ...(dto.telefono !== undefined && { telefono: dto.telefono || null }),
      ...(dto.direccion !== undefined && { direccion: dto.direccion || null }),
      ...(dto.num_documento !== undefined && {
        num_documento: dto.num_documento,
      }),
      ...(dto.id_tipo_cliente !== undefined && {
        tipo_cliente: {
          connect: { id_tipo_cliente: dto.id_tipo_cliente },
        },
      }),
      ...(dto.id_municipio !== undefined && {
        municipios: {
          connect: { id_municipio: dto.id_municipio },
        },
      }),
      ...(dto.id_tipo_doc !== undefined && {
        tipo_documento: {
          connect: { id_tipo_doc: dto.id_tipo_doc },
        },
      }),
      ...(dto.estado !== undefined && { estado: dto.estado }),
    };

    return this.prisma.cliente.update({
      where: { id_cliente: id },
      data,
      include: {
        tipo_cliente: true,
        municipios: true,
        tipo_documento: true,
      },
    });
  }

  async remove(id: number) {
    const existeCliente = await this.prisma.cliente.findUnique({
      where: { id_cliente: id },
      select: { id_cliente: true },
    });

    if (!existeCliente) {
      throw new NotFoundException('Cliente no existe');
    }

    return this.prisma.cliente.update({
      where: { id_cliente: id },
      data: { estado: false },
      include: {
        tipo_cliente: true,
        municipios: true,
        tipo_documento: true,
      },
    });
  }
}