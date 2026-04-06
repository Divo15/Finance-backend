import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const records = await this.prisma.financialRecord.findMany({
      where: { isDeleted: false },
    });

    const totalIncome = records
      .filter((r) => r.type === 'INCOME')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = records
      .filter((r) => r.type === 'EXPENSE')
      .reduce((sum, r) => sum + r.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // Category breakdown
    const byCategory = records.reduce((acc: any, r) => {
      if (!acc[r.category]) acc[r.category] = 0;
      acc[r.category] += r.amount;
      return acc;
    }, {});

    // Monthly trends
    const monthlyTrends = records.reduce((acc: any, r) => {
      const key = r.date.toISOString().slice(0, 7);
      if (!acc[key]) acc[key] = { income: 0, expense: 0 };
      if (r.type === 'INCOME') acc[key].income += r.amount;
      else acc[key].expense += r.amount;
      return acc;
    }, {});

    // Recent activity
    const recentActivity = await this.prisma.financialRecord.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return {
      totalIncome,
      totalExpense,
      netBalance,
      byCategory,
      monthlyTrends,
      recentActivity,
    };
  }

  async getWeeklyTrends() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const records = await this.prisma.financialRecord.findMany({
      where: {
        isDeleted: false,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    const daily = records.reduce((acc: any, r) => {
      const key = r.date.toISOString().slice(0, 10);
      if (!acc[key]) acc[key] = { income: 0, expense: 0 };
      if (r.type === 'INCOME') acc[key].income += r.amount;
      else acc[key].expense += r.amount;
      return acc;
    }, {});

    return { period: 'last_7_days', daily };
  }
}