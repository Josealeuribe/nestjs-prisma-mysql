import { Prisma } from '@prisma/client';

export const remisionCompraListSelect =
  Prisma.validator<Prisma.remision_compraSelect>()({
    id_remision_compra: true,
    codigo_remision_compra: true,
    fecha_creacion: true,
    fecha_vencimiento: true,
    observaciones: true,
    id_compra: true,
    id_proveedor: true,
    id_estado_remision_compra: true,
    id_usuario_creador: true,
    id_factura: true,
    afecta_existencias: true,
    fecha_aplicacion_existencias: true,
    id_usuario_aplico_existencias: true,
    id_bodega: true,

    compras: {
      select: {
        id_compra: true,
        codigo_compra: true,
        id_bodega: true,
      },
    },

    proveedor: {
      select: {
        id_proveedor: true,
      },
    },

    bodega: {
      select: {
        id_bodega: true,
        nombre_bodega: true,
      },
    },

    estado_remision_compra: {
      select: {
        id_estado_remision_compra: true,
      },
    },

    usuario: {
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
      },
    },

    usuario_remision_compra_id_usuario_aplico_existenciasTousuario: {
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
      },
    },
  });

export const remisionCompraDetailSelect =
  Prisma.validator<Prisma.remision_compraSelect>()({
    id_remision_compra: true,
    codigo_remision_compra: true,
    fecha_creacion: true,
    fecha_vencimiento: true,
    observaciones: true,
    id_compra: true,
    id_proveedor: true,
    id_estado_remision_compra: true,
    id_usuario_creador: true,
    id_factura: true,
    firma_digital: true,
    nombre_firmante: true,
    fecha_firma: true,
    afecta_existencias: true,
    fecha_aplicacion_existencias: true,
    id_usuario_aplico_existencias: true,
    id_bodega: true,

    compras: {
      select: {
        id_compra: true,
        codigo_compra: true,
        id_bodega: true,
      },
    },

    proveedor: {
      select: {
        id_proveedor: true,
      },
    },

    bodega: {
      select: {
        id_bodega: true,
        nombre_bodega: true,
      },
    },

    estado_remision_compra: {
      select: {
        id_estado_remision_compra: true,
      },
    },

    usuario: {
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
      },
    },

    usuario_remision_compra_id_usuario_aplico_existenciasTousuario: {
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
      },
    },

    detalle_remision_compra: {
      select: {
        id_detalle_remision_compra: true,
        id_producto: true,
        cantidad: true,
        precio_unitario: true,
        id_iva: true,
        lote: true,
        fecha_vencimiento: true,
        codigo_barras: true,
        nota: true,

        producto: {
          select: {
            id_producto: true,
          },
        },

        iva: {
          select: {
            id_iva: true,
          },
        },
      },
    },
  });
