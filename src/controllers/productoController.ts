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

export const getAll = async (_req: Request, res: Response): Promise<any> => {
  try {
    const productos = await prisma.producto.findMany();
    const response: ApiResponse<typeof productos> = {
      success: true,
      message: "Productos obtenidos con éxito",
      errors: [],
      data: serializeBigInt(productos),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener los productos",
        errors: [error instanceof Error ? error.message : String(error)],
      });
  }
};

export const getById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
        errors: ['El ID proporcionado no es válido']
      });
    }

    const producto = await prisma.producto.findUnique({
      where: {
        productoId: BigInt(id),
      },
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        errors: ['No se encontró un producto con el ID proporcionado']
      });
    }

    const response: ApiResponse<typeof producto> = {
      success: true,
      message: "Producto obtenido con éxito",
      data: serializeBigInt(producto),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener el producto",
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
};

export const create = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombre, descripcion, precio, existencia, productoId } = req.body;

    if (!nombre || precio === undefined || existencia === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El nombre, precio y existencia son requeridos',
        errors: ['Los campos nombre, precio y existencia son obligatorios']
      });
    }

    // Validate productoId is 0 if provided
    if (productoId !== undefined && productoId !== 0) {
      return res.status(400).json({
        success: false,
        message: 'El ProductoId debe ser 0',
        errors: ['El campo ProductoId debe ser establecido a 0']
      });
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio: typeof precio === 'string' ? parseFloat(precio) : precio,
        existencia: BigInt(existencia),
      },
    });

    const response: ApiResponse<typeof producto> = {
      success: true,
      message: "Producto creado con éxito",
      errors: [],
      data: serializeBigInt(producto),
    };

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al crear el producto",
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
};

export const update = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, existencia } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
        errors: ['El ID proporcionado no es válido']
      });
    }

    if (!nombre && descripcion === undefined && precio === undefined && existencia === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar',
        errors: ['Debe proporcionar al menos un campo para actualizar']
      });
    }

    const existingProducto = await prisma.producto.findUnique({
      where: {
        productoId: BigInt(id),
      },
    });

    if (!existingProducto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        errors: ['No se encontró un producto con el ID proporcionado']
      });
    }

    const producto = await prisma.producto.update({
      where: {
        productoId: BigInt(id),
      },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio !== undefined && { precio: typeof precio === 'string' ? parseFloat(precio) : precio }),
        ...(existencia !== undefined && { existencia: BigInt(existencia) }),
      },
    });

    const response: ApiResponse<typeof producto> = {
      success: true,
      message: "Producto actualizado con éxito",
      data: serializeBigInt(producto),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el producto",
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
};
