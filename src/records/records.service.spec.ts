import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from './records.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockRecord = {
  id: 'record-id-123',
  amount: 5000,
  type: 'INCOME',
  category: 'Salary',
  date: new Date('2026-04-01'),
  notes: 'Monthly salary',
  isDeleted: false,
  userId: 'user-id-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user-id-123', name: 'Admin', email: 'admin@test.com' },
};

const mockPrismaService = {
  financialRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

describe('RecordsService', () => {
  let recordsService: RecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    recordsService = module.get<RecordsService>(RecordsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── CREATE ─────────────────────────────────────────────────
  describe('create', () => {
    it('should create a financial record successfully', async () => {
      mockPrismaService.financialRecord.create.mockResolvedValue(mockRecord);

      const result = await recordsService.create(
        {
          amount: 5000,
          type: 'INCOME' as any,
          category: 'Salary',
          date: '2026-04-01T00:00:00.000Z',
          notes: 'Monthly salary',
        },
        'user-id-123',
      );

      expect(result).toEqual(mockRecord);
      expect(mockPrismaService.financialRecord.create).toHaveBeenCalledTimes(1);
    });
  });

  // ─── FIND ALL ────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated records', async () => {
      mockPrismaService.financialRecord.findMany.mockResolvedValue([mockRecord]);
      mockPrismaService.financialRecord.count.mockResolvedValue(1);

      const result = await recordsService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by type', async () => {
      mockPrismaService.financialRecord.findMany.mockResolvedValue([mockRecord]);
      mockPrismaService.financialRecord.count.mockResolvedValue(1);

      const result = await recordsService.findAll({ type: 'INCOME' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('INCOME');
    });
  });

  // ─── FIND ONE ────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a record by id', async () => {
      mockPrismaService.financialRecord.findFirst.mockResolvedValue(mockRecord);

      const result = await recordsService.findOne('record-id-123');

      expect(result).toEqual(mockRecord);
    });

    it('should throw NotFoundException if record not found', async () => {
      mockPrismaService.financialRecord.findFirst.mockResolvedValue(null);

      await expect(
        recordsService.findOne('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── SOFT DELETE ─────────────────────────────────────────────
  describe('remove', () => {
    it('should soft delete a record', async () => {
      mockPrismaService.financialRecord.findFirst.mockResolvedValue(mockRecord);
      mockPrismaService.financialRecord.update.mockResolvedValue({
        ...mockRecord,
        isDeleted: true,
      });

      const result = await recordsService.remove('record-id-123');

      expect(result).toEqual({ message: 'Record deleted successfully' });
      expect(mockPrismaService.financialRecord.update).toHaveBeenCalledWith({
        where: { id: 'record-id-123' },
        data: { isDeleted: true },
      });
    });
  });
});