import { Request, Response } from 'express';
import { PrismaClient, ItemType } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/inventory - Get all inventory items, with optional filtering by type
export const getInventory = async (req: Request, res: Response) => {
  const { type } = req.query;

  try {
    const whereClause: { type?: ItemType } = {};
    if (type && (type === 'STATIONERY' || type === 'UNIFORM')) {
      whereClause.type = type as ItemType;
    }

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/inventory - Add a new item (Admin only)
export const addItem = async (req: Request, res: Response) => {
  const { name, description, type, price, stock } = req.body;
  try {
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        description,
        type,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      },
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};