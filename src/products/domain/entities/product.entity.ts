/**
 * Domain Entity: Product
 * Representa el modelo de dominio de un producto
 */
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('Product ID is required');
    }
    if (!this.name || this.name.trim() === '') {
      throw new Error('Product name is required');
    }
    if (this.price < 0) {
      throw new Error('Product price cannot be negative');
    }
    if (this.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }
  }

  isAvailable(): boolean {
    return this.stock > 0;
  }

  getTotalValue(): number {
    return this.price * this.stock;
  }
}
