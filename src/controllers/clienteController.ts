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
    const clientes = await prisma.cliente.findMany();
    const response: ApiResponse<typeof clientes> = {
      success: true,
      message: "Clientes obtenidos con éxito",
      errors: [],
      data: serializeBigInt(clientes),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener los clientes",
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
        message: 'ID de cliente inválido',
        errors: ['El ID proporcionado no es válido']
      });
    }

    const cliente = await prisma.cliente.findUnique({
      where: {
        clienteId: BigInt(id),
      },
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
        errors: ['No se encontró un cliente con el ID proporcionado']
      });
    }

    const response: ApiResponse<typeof cliente> = {
      success: true,
      message: "Cliente obtenido con éxito",
      data: serializeBigInt(cliente),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener el cliente",
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
};

export const create = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombre, identidad, clienteId } = req.body;

    if (!nombre || !identidad) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y la identidad son requeridos',
        errors: ['Todos los campos son obligatorios']
      });
    }

    // Validate clienteId is 0 if provided
    if (clienteId !== undefined && clienteId !== 0) {
      return res.status(400).json({
        success: false,
        message: 'El ClienteId debe ser 0',
        errors: ['El campo ClienteId debe ser establecido a 0']
      });
    }

    // Check if identidad is unique
    const existingClient = await prisma.cliente.findFirst({
      where: {
        identidad: identidad
      }
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'La identidad ya existe',
        errors: ['Ya existe un cliente registrado con esta identidad']
      });
    }

    const cliente = await prisma.cliente.create({
      data: {
        clienteId: BigInt(clienteId || 0),
        nombre,
        identidad,
      },
    });

    const response: ApiResponse<typeof cliente> = {
      success: true,
      message: "Cliente creado con éxito",
      data: serializeBigInt(cliente),
    };

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al crear el cliente",
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
};

export const update = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { nombre, identidad } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido',
        errors: ['El ID proporcionado no es válido']
      });
    }

    if (!nombre && !identidad) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar',
        errors: ['Debe proporcionar al menos un campo para actualizar']
      });
    }

    const existingCliente = await prisma.cliente.findUnique({
      where: {
        clienteId: BigInt(id),
      },
    });

    if (!existingCliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
        errors: ['No se encontró un cliente con el ID proporcionado']
      });
    }

    const cliente = await prisma.cliente.update({
      where: {
        clienteId: BigInt(id),
      },
      data: {
        ...(nombre && { nombre }),
        ...(identidad && { identidad }),
      },
    });

    const response: ApiResponse<typeof cliente> = {
      success: true,
      message: "Cliente actualizado con éxito",
      data: serializeBigInt(cliente),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el cliente",
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
};
