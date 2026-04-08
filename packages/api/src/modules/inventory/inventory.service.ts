import { InventoryRepository } from './inventory.repository.js';

export class InventoryService {
  constructor(private repo: InventoryRepository) {}

  async getStockList(filters: { lowStock?: boolean; page: number; pageSize: number }) { return this.repo.findAll(filters); }

  async updateStock(productId: string, stock: number) {
    const product = await this.repo.findByProductId(productId);
    if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
    await this.repo.updateStock(productId, stock);
    return { productId, productName: product.name, stock, reservedStock: 0, availableStock: stock };
  }
}
