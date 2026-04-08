import prisma from '../../shared/database/connection.js';

export class AnalyticsRepository {
  async getDashboardKPIs() {
    const [revenue, orderCount, productCount, lowStock, recentOrders, topProducts, ordersByStatus] = await Promise.all([
      prisma.order.aggregate({ where: { status: { not: 'cancelled' } }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lt: parseInt(process.env.LOW_STOCK_THRESHOLD || '10') } } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
      prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true, price: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
    ]);
    return { totalRevenue: revenue._sum.total || 0, totalOrders: orderCount, totalProducts: productCount, lowStockCount: lowStock, recentOrders, topProducts, ordersByStatus: Object.fromEntries(ordersByStatus.map(o => [o.status, o._count])) };
  }
}
