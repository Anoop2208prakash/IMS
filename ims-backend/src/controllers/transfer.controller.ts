import { Request, Response } from 'express';
import { PrismaClient, Role, Prisma, ItemCategory } from '@prisma/client'; // 1. Import ItemCategory
import Papa from 'papaparse';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Sanitizes a cell value for CSV (handles commas, quotes, newlines).
 */
const sanitizeCell = (value: string | number): string => {
  let strValue = String(value);
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
    strValue = `"${strValue.replace(/"/g, '""')}"`;
  }
  return strValue;
};

/**
 * Helper function to generate a unique 7-digit SID
 */
const generateSID = async (): Promise<string> => {
  let sID = Math.floor(1000000 + Math.random() * 9000000).toString();
  const existing = await prisma.user.findUnique({ where: { sID } });
  if (existing) {
    return await generateSID(); // Recurse if it exists
  }
  return sID;
};

// --- SEMESTER EXPORT ---
export const exportSemestersCSV = async (req: Request, res: Response) => {
  const { programId, searchTerm } = req.query;

  try {
    let whereClause: any = {};
    if (programId && programId !== 'all') {
      whereClause.programId = String(programId);
    }
    
    if (searchTerm) {
      const search = String(searchTerm).toLowerCase();
      whereClause.OR = [
        { name: { contains: search } },
        { program: { title: { contains: search } } },
      ];
    }

    const semesters = await prisma.semester.findMany({
      where: whereClause,
      include: {
        program: { select: { title: true } },
      },
      orderBy: { name: 'asc' },
    });

    if (semesters.length === 0) {
      return res.status(404).json({ message: 'No data to export.' });
    }

    const headers = ['Semester Name', 'Program'];
    const headerString = headers.join(',');

    const rows = semesters.map(semester => {
      const name = sanitizeCell(semester.name);
      const program = sanitizeCell(semester.program.title);
      return [name, program].join(',');
    });

    const csvContent = [headerString, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="semesters_export.csv"');
    res.status(200).send(csvContent);

  } catch (error) {
    res.status(500).json({ message: 'Failed to export data.' });
  }
};

// --- SEMESTER IMPORT ---
export const importSemestersCSV = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded.' });
  }

  try {
    const csvString = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return res.status(400).json({ message: 'Error parsing CSV file.', errors: parseResult.errors });
    }

    const rows = parseResult.data as Array<{ [key: string]: string }>;
    if (rows.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty.' });
    }

    let processedCount = 0;

    const programs = await prisma.program.findMany({
      select: { id: true, title: true }
    });
    const programMap = new Map(programs.map(p => [p.title.toLowerCase(), p.id]));

    const semestersToCreate: Array<{ name: string; programId: string }> = [];

    for (const row of rows) {
      const programTitle = row['Program'];
      const semesterName = row['Semester Name'];

      if (!programTitle || !semesterName) {
        throw new Error('CSV must have "Program" and "Semester Name" columns.');
      }

      const programId = programMap.get(programTitle.toLowerCase());

      if (!programId) {
        throw new Error(`Program not found in database: "${programTitle}"`);
      }

      semestersToCreate.push({
        name: semesterName,
        programId: programId,
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const data of semestersToCreate) {
        await tx.semester.upsert({
          where: { programId_name: { programId: data.programId, name: data.name } },
          update: {},
          create: data,
        });
        processedCount++;
      }
    });

    res.status(201).json({ message: `Successfully processed ${processedCount} semesters.` });

  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to import data.' });
  }
};

// --- SUBJECT EXPORT ---
export const exportSubjectsCSV = async (req: Request, res: Response) => {
  const { programId, semesterId, searchTerm } = req.query;

  try {
    let whereClause: any = {};

    if (semesterId && semesterId !== 'all') {
      whereClause.semesterId = String(semesterId);
    } else if (programId && programId !== 'all') {
      whereClause.semester = { programId: String(programId) };
    }
    
    if (searchTerm) {
      const search = String(searchTerm).toLowerCase();
      whereClause.OR = [
        { title: { contains: search } },
        { subjectCode: { contains: search } },
      ];
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        semester: { include: { program: true } },
      },
      orderBy: { title: 'asc' },
    });

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'No data to export.' });
    }

    const headers = ['Subject Title', 'Subject Code', 'Program', 'Semester', 'Credits'];
    const headerString = headers.join(',');

    const rows = subjects.map(s => {
      return [
        sanitizeCell(s.title),
        sanitizeCell(s.subjectCode),
        sanitizeCell(s.semester.program.title),
        sanitizeCell(s.semester.name),
        sanitizeCell(s.credits),
      ].join(',');
    });

    const csvContent = [headerString, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="subjects_export.csv"');
    res.status(200).send(csvContent);

  } catch (error) {
    res.status(500).json({ message: 'Failed to export subjects.' });
  }
};

// --- SUBJECT IMPORT ---
export const importSubjectsCSV = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded.' });
  }

  try {
    const csvString = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return res.status(400).json({ message: 'Error parsing CSV file.', errors: parseResult.errors });
    }

    const rows = parseResult.data as Array<{ [key: string]: string }>;
    if (rows.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty.' });
    }

    const semesters = await prisma.semester.findMany({
      include: { program: { select: { title: true } } },
    });
    
    const semesterMap = new Map(semesters.map(s => [
      `${s.program.title.toLowerCase()} - ${s.name.toLowerCase()}`,
      s.id
    ]));

    const subjectsToCreate: Array<{ title: string; subjectCode: string; credits: number; semesterId: string }> = [];

    for (const row of rows) {
      const { 'Subject Title': title, 'Subject Code': subjectCode, 'Program': program, 'Semester': semester, 'Credits': credits } = row;
      
      if (!title || !subjectCode || !program || !semester || !credits) {
        throw new Error('CSV must have columns: "Subject Title", "Subject Code", "Program", "Semester", "Credits"');
      }

      const mapKey = `${program.toLowerCase()} - ${semester.toLowerCase()}`;
      const semesterId = semesterMap.get(mapKey);

      if (!semesterId) {
        throw new Error(`Could not find matching semester for: "${program} - ${semester}"`);
      }

      subjectsToCreate.push({
        title,
        subjectCode,
        credits: parseInt(credits),
        semesterId,
      });
    }

    let processedCount = 0;
    await prisma.$transaction(async (tx) => {
      for (const data of subjectsToCreate) {
        await tx.subject.upsert({
          where: { subjectCode: data.subjectCode },
          update: data,
          create: data,
        });
        processedCount++;
      }
    });

    res.status(201).json({ message: `Successfully processed ${processedCount} subjects.` });

  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to import data.' });
  }
};

// --- TEACHER EXPORT ---
export const exportTeachersCSV = async (req: Request, res: Response) => {
  const { searchTerm } = req.query;

  try {
    let whereClause: any = { role: 'TEACHER' };
    
    if (searchTerm) {
      const search = String(searchTerm).toLowerCase();
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { sID: { contains: search } },
        { teacher: { department: { contains: search } } },
      ];
    }

    const teachers = await prisma.user.findMany({
      where: whereClause,
      select: {
        name: true,
        email: true,
        sID: true,
        teacher: {
          select: {
            department: true,
            dateJoined: true,
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    if (teachers.length === 0) {
      return res.status(404).json({ message: 'No data to export.' });
    }

    const headers = ['Name', 'Email', 'SID', 'Department', 'Date Joined'];
    const headerString = headers.join(',');

    const rows = teachers.map(t => {
      return [
        sanitizeCell(t.name),
        sanitizeCell(t.email),
        sanitizeCell(t.sID),
        sanitizeCell(t.teacher?.department || 'N/A'),
        sanitizeCell(new Date(t.teacher!.dateJoined).toLocaleDateString()),
      ].join(',');
    });

    const csvContent = [headerString, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="teachers_export.csv"');
    res.status(200).send(csvContent);

  } catch (error) {
    res.status(500).json({ message: 'Failed to export teachers.' });
  }
};

// --- TEACHER IMPORT ---
export const importTeachersCSV = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded.' });
  }

  try {
    const csvString = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return res.status(400).json({ message: 'Error parsing CSV file.', errors: parseResult.errors });
    }

    const rows = parseResult.data as Array<{ [key: string]: string }>;
    if (rows.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty.' });
    }

    let processedCount = 0;
    const teachersToCreate: Prisma.UserCreateInput[] = [];

    for (const row of rows) {
      const { 'Name': name, 'Email': email, 'Department': department, 'Password': password } = row;
      
      if (!name || !email || !department || !password) {
        throw new Error('CSV must have columns: "Name", "Email", "Department", "Password"');
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const sID = await generateSID();

      teachersToCreate.push({
        name,
        email,
        sID,
        password: hashedPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            department,
            dateJoined: new Date(),
          },
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const data of teachersToCreate) {
        await tx.user.create({ data });
        processedCount++;
      }
    });

    res.status(201).json({ message: `Successfully processed and created ${processedCount} new teachers.` });

  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to import data.' });
  }
};

// --- PROGRAM EXPORT ---
export const exportProgramsCSV = async (req: Request, res: Response) => {
  const { searchTerm } = req.query;
  try {
    let whereClause: any = {};
    if (searchTerm) {
      const search = String(searchTerm).toLowerCase();
      whereClause.title = { contains: search };
    }
    const programs = await prisma.program.findMany({
      where: whereClause,
      orderBy: { title: 'asc' },
    });
    if (programs.length === 0) {
      return res.status(404).json({ message: 'No data to export.' });
    }
    const headers = ['Program Title', 'Duration (Years)'];
    const headerString = headers.join(',');
    const rows = programs.map(p => [
      sanitizeCell(p.title),
      sanitizeCell(p.durationYears),
    ].join(','));
    const csvContent = [headerString, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="programs_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export programs.' });
  }
};

// --- PROGRAM IMPORT ---
export const importProgramsCSV = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded.' });
  }
  try {
    const csvString = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvString, { header: true, skipEmptyLines: true });
    if (parseResult.errors.length > 0) {
      return res.status(400).json({ message: 'Error parsing CSV file.', errors: parseResult.errors });
    }
    const rows = parseResult.data as Array<{ [key: string]: string }>;
    if (rows.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty.' });
    }
    let processedCount = 0;
    const programsToCreate: Prisma.ProgramCreateInput[] = [];
    for (const row of rows) {
      const { 'Program Title': title, 'Duration (Years)': durationYears } = row;
      if (!title || !durationYears) {
        throw new Error('CSV must have columns: "Program Title", "Duration (Years)"');
      }
      programsToCreate.push({
        title,
        durationYears: parseInt(durationYears),
      });
    }
    await prisma.$transaction(async (tx) => {
      for (const data of programsToCreate) {
        await tx.program.upsert({
          where: { title: data.title },
          update: { durationYears: data.durationYears },
          create: data,
        });
        processedCount++;
      }
    });
    res.status(201).json({ message: `Successfully processed ${processedCount} programs.` });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to import data.' });
  }
};

// --- EXAM EXPORT ---
export const exportExamsCSV = async (req: Request, res: Response) => {
  const { searchTerm } = req.query;

  try {
    let whereClause: any = {};
    
    if (searchTerm) {
      const search = String(searchTerm).toLowerCase();
      whereClause.name = { contains: search };
    }

    const exams = await prisma.exam.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    if (exams.length === 0) {
      return res.status(404).json({ message: 'No data to export.' });
    }

    const headers = ['Exam Name', 'Date', 'Total Marks'];
    const headerString = headers.join(',');

    const rows = exams.map(exam => {
      return [
        sanitizeCell(exam.name),
        sanitizeCell(new Date(exam.date).toLocaleDateString()),
        sanitizeCell(exam.totalMarks),
      ].join(',');
    });

    const csvContent = [headerString, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="exams_export.csv"');
    res.status(200).send(csvContent);

  } catch (error) {
    res.status(500).json({ message: 'Failed to export exams.' });
  }
};

// --- EXAM IMPORT ---
export const importExamsCSV = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded.' });
  }

  try {
    const csvString = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return res.status(400).json({ message: 'Error parsing CSV file.', errors: parseResult.errors });
    }

    const rows = parseResult.data as Array<{ [key: string]: string }>;
    if (rows.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty.' });
    }

    let processedCount = 0;
    const examsToCreate: Prisma.ExamCreateInput[] = [];

    for (const row of rows) {
      const { 'Exam Name': name, 'Date': date, 'Total Marks': totalMarks } = row;
      
      if (!name || !date || !totalMarks) {
        throw new Error('CSV must have columns: "Exam Name", "Date", "Total Marks"');
      }

      examsToCreate.push({
        name,
        date: new Date(date),
        totalMarks: parseInt(totalMarks),
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const data of examsToCreate) {
        await tx.exam.upsert({
          where: { name: data.name },
          update: { date: data.date, totalMarks: data.totalMarks },
          create: data,
        });
        processedCount++;
      }
    });

    res.status(201).json({ message: `Successfully processed ${processedCount} exams.` });

  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to import data.' });
  }
};

// --- INVENTORY EXPORT ---
export const exportInventoryCSV = async (req: Request, res: Response) => {
  const { category, searchTerm } = req.query;

  try {
    let whereClause: any = {};

    if (category && category !== 'all') {
      whereClause.category = category as ItemCategory;
    }
    
    if (searchTerm) {
      const search = String(searchTerm).toLowerCase();
      whereClause.name = { contains: search };
    }

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    if (items.length === 0) {
      return res.status(404).json({ message: 'No data to export.' });
    }

    const headers = ['Item Name', 'Category', 'Price', 'Stock'];
    const headerString = headers.join(',');

    const rows = items.map(item => {
      return [
        sanitizeCell(item.name),
        sanitizeCell(item.category),
        sanitizeCell(item.price),
        sanitizeCell(item.quantityInStock),
      ].join(',');
    });

    const csvContent = [headerString, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory_export.csv"');
    res.status(200).send(csvContent);

  } catch (error) {
    res.status(500).json({ message: 'Failed to export inventory.' });
  }
};

// --- INVENTORY IMPORT ---
export const importInventoryCSV = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded.' });
  }

  try {
    const csvString = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return res.status(400).json({ message: 'Error parsing CSV file.', errors: parseResult.errors });
    }

    const rows = parseResult.data as Array<{ [key: string]: string }>;
    if (rows.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty.' });
    }

    let processedCount = 0;
    const itemsToCreate: Prisma.InventoryItemCreateInput[] = [];

    for (const row of rows) {
      const { 'Item Name': name, 'Category': category, 'Price': price, 'Stock': stock } = row;
      
      if (!name || !category || !price || !stock) {
        throw new Error('CSV must have columns: "Item Name", "Category", "Price", "Stock"');
      }

      const itemCategory = category.toUpperCase() as ItemCategory;
      if (!Object.values(ItemCategory).includes(itemCategory)) {
        throw new Error(`Invalid category: "${category}". Must be UNIFORM, STATIONARY, or OTHER.`);
      }

      itemsToCreate.push({
        name,
        category: itemCategory,
        price: parseFloat(price),
        quantityInStock: parseInt(stock),
      });
    }

    // --- THIS IS THE FIX ---
    // We cannot use 'upsert' because 'name' is not a unique field.
    // We will use 'create' instead.
    await prisma.$transaction(async (tx) => {
      for (const data of itemsToCreate) {
        // Check if an item with this name *already exists*
        const existingItem = await tx.inventoryItem.findFirst({
          where: { name: { equals: data.name } }
        });
        
        // Only create if it doesn't exist.
        if (!existingItem) {
          await tx.inventoryItem.create({
            data: data,
          });
          processedCount++;
        }
        // If it exists, we skip it.
      }
    });
    
    if (processedCount === 0 && itemsToCreate.length > 0) {
      return res.status(200).json({ message: 'Import complete. All items already existed.' });
    }

    res.status(201).json({ message: `Successfully processed and created ${processedCount} new items.` });

  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to import data.' });
  }
};