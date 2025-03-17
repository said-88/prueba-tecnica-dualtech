import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { serializeBigInt } from '../utils/serializeBigInt';

const prisma = new PrismaClient();

interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  errors?: string[];
  data?: T;
}

interface DetalleOrdenInput {
  productoId: number | bigint;
  cantidad: number;
}

interface OrdenInput {
  ordenId: number | bigint;
  clienteId: number | bigint;
  detalle: DetalleOrdenInput[];
}

export const create = async (req: Request, res: Response): Promise<any> => {
  try {
    const { ordenId, clienteId, detalle }: OrdenInput = req.body;

    // Validación 1: OrdenId debe ser 0
    if (ordenId !== undefined && ordenId !== 0) {
      return res.status(400).json({
        success: false,
        message: 'El OrdenId debe ser 0',
        errors: ['El campo OrdenId debe ser establecido a 0']
      });
    }

    // Validación 2: Validar que exista un cliente con ese ID
    const clienteExistente = await prisma.cliente.findUnique({
      where: {
        clienteId: BigInt(clienteId)
      }
    });

    if (!clienteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Cliente no encontrado',
        errors: [`No existe un cliente con el ID ${clienteId}`]
      });
    }

    // Validar que el detalle tenga al menos un ítem
    if (!detalle || !Array.isArray(detalle) || detalle.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un detalle para la orden',
        errors: ['Debe proporcionar al menos un ítem de detalle']
      });
    }

    // Crear orden inicializando los campos calculados en 0
    const orden = await prisma.orden.create({
      data: {
        clienteId: BigInt(clienteId),
        impuesto: 0,
        subtotal: 0,
        total: 0
      }
    });

    // Procesar cada detalle de la orden
    const detallesCreados = [];
    let totalImpuesto = 0;
    let totalSubtotal = 0;
    let totalGeneral = 0;

    // Validar todos los productos primero para garantizar integridad
    for (const item of detalle) {
      const producto = await prisma.producto.findUnique({
        where: {
          productoId: BigInt(item.productoId)
        }
      });

      if (!producto) {
        // Revertir la orden creada si un producto no existe
        await prisma.orden.delete({
          where: {
            ordenId: orden.ordenId
          }
        });

        return res.status(400).json({
          success: false,
          message: 'Producto no encontrado',
          errors: [`No existe un producto con el ID ${item.productoId}`]
        });
      }

      // Validar existencia de stock suficiente
      if (item.cantidad > Number(producto.existencia)) {
        // Revertir la orden creada si un producto no tiene existencias suficientes
        await prisma.orden.delete({
          where: {
            ordenId: orden.ordenId
          }
        });

        return res.status(400).json({
          success: false,
          message: 'Existencia insuficiente',
          errors: [`El producto ${producto.nombre} no tiene suficientes existencias para procesar la orden. Disponible: ${producto.existencia}, Solicitado: ${item.cantidad}`]
        });
      }
    }

    // Procesar cada detalle y crear los registros
    for (const item of detalle) {
      const producto = await prisma.producto.findUnique({
        where: {
          productoId: BigInt(item.productoId)
        }
      });

      // Calcular importes para este detalle
      const subtotal = Number(producto!.precio) * item.cantidad;
      const impuesto = subtotal * 0.15;
      const total = subtotal + impuesto;

      // Actualizar totales generales
      totalSubtotal += subtotal;
      totalImpuesto += impuesto;
      totalGeneral += total;

      // Crear detalle
      const detalleCreado = await prisma.detalleOrden.create({
        data: {
          ordenId: orden.ordenId,
          productoId: BigInt(item.productoId),
          cantidad: item.cantidad,
          impuesto: impuesto,
          subtotal: subtotal,
          total: total
        }
      });

      detallesCreados.push(detalleCreado);
    }

    // Actualizar la orden con los totales calculados
    const ordenActualizada = await prisma.orden.update({
      where: {
        ordenId: orden.ordenId
      },
      data: {
        impuesto: totalImpuesto,
        subtotal: totalSubtotal,
        total: totalGeneral
      },
      include: {
        detalles: true
      }
    });

    const response: ApiResponse<typeof ordenActualizada> = {
      success: true,
      message: "Orden creada con éxito",
      errors: [],
      data: serializeBigInt(ordenActualizada),
    };

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al crear la orden",
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
};
