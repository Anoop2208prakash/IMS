import { Request, Response } from 'express';
import { PrismaClient, ItemCategory } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
const prisma = new PrismaClient();

// GET all items (UPDATED with category filter)
export const getAllItems = async (req: Request, res: Response) => {
  const { category } = req.query;

  // Build a where clause for the query
  let whereClause = {};
  if (category && category !== 'all') {
    whereClause = {
      category: category as ItemCategory,
    };
  }

  try {
    const items = await prisma.inventoryItem.findMany({
      where: whereClause, // Apply the filter
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory items.' });
  }
};

// ADD a new item (for Admins)
export const addItem = async (req: Request, res: Response) => {
  const { name, category, price, quantityInStock } = req.body;
  if (!name || !category || price == null || quantityInStock == null) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        category: category as ItemCategory,
        price: parseFloat(price),
        quantityInStock: parseInt(quantityInStock),
      },
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create inventory item.' });
  }
};

// UPDATE an item (for Admins)
export const updateItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, price, quantityInStock } = req.body;
  if (!name || !category || price == null || quantityInStock == null) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        category: category as ItemCategory,
        price: parseFloat(price),
        quantityInStock: parseInt(quantityInStock),
      },
    });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update inventory item.' });
  }
};

// DELETE an item (for Admins)
export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Check for associated orders first
    const orderItemCount = await prisma.orderItem.count({ where: { itemId: id } });
    if (orderItemCount > 0) {
      return res.status(400).json({ message: `Cannot delete: this item is part of ${orderItemCount} order(s).` });
    }
    
    // Kept the old issuance check just in case
    const issuanceCount = await prisma.inventoryIssuance.count({ where: { itemId: id } });
    if (issuanceCount > 0) {
      return res.status(400).json({ message: `Cannot delete: this item has been issued ${issuanceCount} time(s).` });
    }

    await prisma.inventoryItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item.' });
  }
};

// This function is no longer used, as purchases are handled by order.controller.ts
// We are keeping it here just in case, but it can be safely removed.
export const purchaseItem = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.id;
  const { itemId, quantity } = req.body;

  if (!studentId || !itemId || !quantity) {
    return res.status(400).json({ message: 'Item ID and quantity are required.' });
  }

  const quantityToBuy = parseInt(quantity);
  if (quantityToBuy <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive number.' });
  }

  try {
    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item || item.quantityInStock < quantityToBuy) {
      return res.status(400).json({ message: 'Item not found or insufficient stock.' });
    }

    const [, issuance] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantityInStock: { decrement: quantityToBuy } },
      }),
      prisma.inventoryIssuance.create({
        data: { itemId, userId: studentId, quantityIssued: quantityToBuy },
      }),
    ]);

    res.status(201).json({ message: 'Purchase successful!', issuance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process purchase.' });
  }
};