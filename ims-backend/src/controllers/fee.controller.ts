import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// --- FEE STRUCTURES ---

export const getAllFeeStructures = async (req: Request, res: Response) => {
    try {
        const feeStructures = await prisma.feeStructure.findMany({
            include: { course: { select: { title: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(feeStructures);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch fee structures.' }); }
};

export const addFeeStructure = async (req: Request, res: Response) => {
    const { name, amount, courseId } = req.body;
    if (!name || !amount || !courseId) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const newStructure = await prisma.feeStructure.create({
            data: { name, amount: parseFloat(amount), courseId },
        });
        res.status(201).json(newStructure);
    } catch (error) { res.status(500).json({ message: 'Failed to create fee structure.' }); }
};

export const updateFeeStructure = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, amount, courseId } = req.body;
    if (!name || amount == null || !courseId) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const updatedStructure = await prisma.feeStructure.update({
            where: { id },
            data: { name, amount: parseFloat(amount), courseId },
        });
        res.status(200).json(updatedStructure);
    } catch (error) { res.status(500).json({ message: 'Failed to update fee structure.' }); }
};

export const deleteFeeStructure = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const invoiceCount = await prisma.feeInvoice.count({ where: { feeStructureId: id } });
        if (invoiceCount > 0) {
            return res.status(400).json({ message: `Cannot delete: ${invoiceCount} invoice(s) are linked to this structure.` });
        }
        await prisma.feeStructure.delete({ where: { id } });
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: 'Failed to delete fee structure.' }); }
};


// --- FEE INVOICES ---

export const generateInvoices = async (req: Request, res: Response) => {
    const { feeStructureId, studentIds, dueDate } = req.body;
    if (!feeStructureId || !studentIds || !Array.isArray(studentIds) || !dueDate) {
        return res.status(400).json({ message: 'Fee structure, student IDs, and due date are required.' });
    }
    try {
        const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
        if (!feeStructure) return res.status(404).json({ message: 'Fee structure not found.' });
        const invoiceData = studentIds.map(userId => ({
            userId, feeStructureId, amount: feeStructure.amount,
            dueDate: new Date(dueDate), status: 'PENDING',
        }));
        const result = await prisma.feeInvoice.createMany({ data: invoiceData, skipDuplicates: true });
        res.status(201).json({ message: `${result.count} invoice(s) generated successfully.` });
    } catch (error) { res.status(500).json({ message: 'Failed to generate invoices.' }); }
};

export const getMyInvoices = async (req: AuthRequest, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'Not authenticated.' });
    try {
        const invoices = await prisma.feeInvoice.findMany({
            where: { userId: studentId },
            include: { feeStructure: { select: { name: true } } },
            orderBy: { dueDate: 'desc' },
        });
        res.status(200).json(invoices);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch invoices.' }); }
};


// --- FEE PAYMENTS ---

export const makePayment = async (req: AuthRequest, res: Response) => {
    const studentId = req.user?.id;
    const { invoiceId, method } = req.body;

    if (!invoiceId || !method || !studentId) {
        return res.status(400).json({ message: 'Invoice ID, payment method, and user authentication are required.' });
    }

    try {
        const invoice = await prisma.feeInvoice.findFirst({ where: { id: invoiceId, userId: studentId } });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found or does not belong to you.' });
        if (invoice.status === 'PAID') return res.status(400).json({ message: 'This invoice has already been paid.' });

        const [payment, updatedInvoice] = await prisma.$transaction([
            prisma.feePayment.create({
                data: {
                    invoiceId, userId: studentId, amount: invoice.amount,
                    method, transactionId: `TXN-${Date.now()}`,
                },
            }),
            prisma.feeInvoice.update({
                where: { id: invoiceId },
                data: { status: 'PAID' },
            }),
        ]);

        res.status(201).json({ message: 'Payment successful!', payment });
    } catch (error) { res.status(500).json({ message: 'Failed to process payment.' }); }
};