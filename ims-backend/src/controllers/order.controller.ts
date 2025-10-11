import { Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
const prisma = new PrismaClient();

// CREATE a new order (for Students)
export const createOrder = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { items } = req.body as { items: Array<{ itemId: string; quantity: number }> };

  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ message: 'User ID and items are required.' });
  }

  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const dbItem = await tx.inventoryItem.findUnique({ where: { id: item.itemId } });

        if (!dbItem || dbItem.quantityInStock < item.quantity) {
          throw new Error(`Insufficient stock for ${dbItem?.name || 'item'}.`);
        }

        await tx.inventoryItem.update({
          where: { id: item.itemId },
          data: { quantityInStock: { decrement: item.quantity } },
        });

        totalAmount += dbItem.price * item.quantity;
        orderItemsData.push({
          itemId: item.itemId,
          quantity: item.quantity,
          priceAtTimeOfPurchase: dbItem.price,
        });
      }

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          orderId: `ORD-${Date.now()}`,
          items: {
            create: orderItemsData,
          },
        },
      });

      return order;
    });

    res.status(201).json({ message: 'Booking successful!', order: newOrder });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create booking.' });
  }
};

// GET the logged-in user's order history (for Students)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
};

// GET details for a single order/invoice (for Students AND Admins)
export const getOrderInvoice = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { orderId } = req.params;

  if (!user) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    // Build a flexible query based on the user's role
    const whereClause: any = { orderId };
    if (user.role === 'STUDENT') {
      whereClause.userId = user.id; // Students can only see their own orders
    }

    const order = await prisma.order.findFirst({
      where: whereClause, // Use the flexible where clause
      include: {
        user: { select: { name: true } },
        items: {
          include: {
            item: { select: { name: true } },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order invoice.' });
  }
};

// GET all orders (for Admins)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all orders.' });
  }
};

// UPDATE an order's status (for Admins)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body as { status: OrderStatus };

  if (!status || !Object.values(OrderStatus).includes(status)) {
    return res.status(400).json({ message: 'A valid status is required.' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status.' });
  }
};