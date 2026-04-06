import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

const mockRecords = [
  {
    id: '1',
    amount: 5000,
    type: 'INCOME',
    category: 'Salary',
    date: new Date('2026-04-01'),
    notes: 'Monthly salary',
    isDeleted: false,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 'user-1', name: 'Admin' },
  },
  {
    id: '2',
    amount: 2000,
    type: 'EXPENSE',
    category: 'Rent',
    date: new Date('2026-04-02'),
    notes: 'Monthly rent',
    isDeleted: false,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 'user-1', name: 'Admin' },
  },
  {
    id: '3',
    amount: 500,
    type: 'EXPENSE',
    category: 'Food',
    date: new Date('2026-04-03'),
    notes: 'Groceries',
    isDeleted: false,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 'user-1', name: 'Admin' },
  },
];

const mockPrismaService = {
  financialRecord: {
    findMany: jest.fn(),
  },
};

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should calculate total income correctly', async () => {
      mockPrismaService.financialRecord.findMany.mockResolvedValue(mockRecords);

      const result = await dashboardService.getSummary();

      expect(result.totalIncome).toBe(5000);
    });

    it('should calculate total expense correctly', async () => {
      mockPrismaService.financialRecord.findMany.mockResolvedValue(mockRecords);

      const result = await dashboardService.getSummary();

      expect(result.totalExpense).toBe(2500);
    });

    it('should calculate net balance correctly', async () => {
      mockPrismaService.financialRecord.findMany.mockResolvedValue(mockRecords);

      const result = await dashboardService.getSummary();

      expect(result.netBalance).toBe(2500);
    });

    it('should return category breakdown', async () => {
      mockPrismaService.financialRecord.findMany.mockResolvedValue(mockRecords);

      const result = await dashboardService.getSummary();

      expect(result.byCategory).toHaveProperty('Salary', 5000);
      expect(result.byCategory).toHaveProperty('Rent', 2000);
      expect(result.byCategory).toHaveProperty('Food', 500);
    });

    it('should return empty summary when no records', async () => {
      mockPrismaService.financialRecord.findMany.mockResolvedValue([]);

      const result = await dashboardService.getSummary();

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.netBalance).toBe(0);
    });
  });
});