import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRecordDto, userId: string) {
    return this.prisma.financialRecord.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        userId,
      },
    });
  }

  async findAll(filters: {
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
})
  {
    const { type, category, startDate, endDate, page = 1, limit = 10 } = filters;

    const where: any = { isDeleted: false };

    if (type) where.type = type;
    if (filters.search) {
  where.OR = [
    { category: { contains: filters.search, mode: 'insensitive' } },
    { notes: { contains: filters.search, mode: 'insensitive' } },
  ];
  }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      this.prisma.financialRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.financialRecord.count({ where }),
    ]);

    return {
      data: records,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!record) throw new NotFoundException('Record not found');
    return record;
  }

  async update(id: string, dto: UpdateRecordDto) {
    await this.findOne(id);
    return this.prisma.financialRecord.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.date && { date: new Date(dto.date) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
    });
    return { message: 'Record deleted successfully' };
  }
}