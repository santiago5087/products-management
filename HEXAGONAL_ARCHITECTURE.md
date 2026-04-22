# Arquitectura Hexagonal - Diagrama Visual

## 🏗️ Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │         ProductController (HTTP Adapter)                │     │
│  │  • GET /products                                        │     │
│  │  • GET /products/:id                                    │     │
│  └─────────────────┬──────────────────────────────────────┘     │
└────────────────────┼──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE APLICACIÓN                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Use Cases (Application Logic)               │    │
│  │  • GetAllProductsUseCase                                │    │
│  │  • GetProductByIdUseCase                                │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────┐                            │
│  │         ProductDto               │                            │
│  └──────────────────────────────────┘                            │
└────────────────────┼──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE DOMINIO                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         Product Entity (Domain Model)                    │    │
│  │  • id, name, description, price, stock                  │    │
│  │  • isAvailable()                                        │    │
│  │  • getTotalValue()                                      │    │
│  │  • validate()                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  IProductRepository (Port - Interface)                   │    │
│  │  • findAll()                                            │    │
│  │  • findById(id)                                         │    │
│  └────────────────┬────────────────────────────────────────┘    │
└────────────────────┼──────────────────────────────────────────┘
                     │ implements
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CAPA DE INFRAESTRUCTURA                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  InMemoryProductRepository (Adapter)                     │    │
│  │  • findAll() → Product[]                                │    │
│  │  • findById(id) → Product | null                        │    │
│  │                                                         │    │
│  │  (Fácilmente reemplazable por:)                        │    │
│  │  • PrismaProductRepository                             │    │
│  │  • TypeOrmProductRepository                            │    │
│  │  • MongoProductRepository                              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Petición HTTP

```
1. HTTP Request: GET /products/1
         │
         ▼
2. ProductController.findOne(id: "1")
         │
         ▼
3. GetProductByIdUseCase.execute("1")
         │
         ▼
4. IProductRepository.findById("1")    ← Puerto (Interface)
         │
         ▼
5. InMemoryProductRepository.findById("1")  ← Adaptador (Implementación)
         │
         ▼
6. Product Entity  ← Entidad de dominio con lógica de negocio
         │
         ▼
7. ProductDto  ← Transformación para la respuesta
         │
         ▼
8. HTTP Response: { id: "1", name: "...", ... }
```

## 🎯 Principio de Inversión de Dependencias

```
┌─────────────────────────────────────────────────────────┐
│  GetProductByIdUseCase (Application)                    │
│         │                                               │
│         │ depends on                                    │
│         ▼                                               │
│  IProductRepository (Interface - Port)                  │
│         △                                               │
│         │ implements                                    │
│         │                                               │
│  InMemoryProductRepository (Adapter)                    │
└─────────────────────────────────────────────────────────┘

✅ El caso de uso depende de la INTERFAZ, no de la implementación
✅ La implementación puede cambiar sin afectar el caso de uso
✅ Fácil testing: mock de IProductRepository
```

## 📦 Inyección de Dependencias en NestJS

```typescript
// products.module.ts
@Module({
  providers: [
    GetAllProductsUseCase,
    GetProductByIdUseCase,
    {
      provide: PRODUCT_REPOSITORY,  // ← Token/Symbol
      useClass: InMemoryProductRepository,  // ← Implementación actual
      
      // Para cambiar a otra implementación:
      // useClass: PrismaProductRepository,
    },
  ],
})
```

## 🧪 Ventajas para Testing

```typescript
// Mock fácil del repositorio
const mockRepository: IProductRepository = {
  findAll: jest.fn().mockResolvedValue([mockProduct]),
  findById: jest.fn().mockResolvedValue(mockProduct),
};

// Test del Use Case sin tocar infraestructura
const useCase = new GetProductByIdUseCase(mockRepository);
```

## 🔧 Extensibilidad

### Agregar nueva operación (CREATE):

1. **Dominio** - Actualizar puerto:
```typescript
interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;  // ← Nueva
}
```

2. **Aplicación** - Nuevo caso de uso:
```typescript
class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private repo: IProductRepository
  ) {}
  
  execute(dto: CreateProductDto): Promise<ProductDto> {
    // Lógica aquí
  }
}
```

3. **Infraestructura** - Implementar:
```typescript
class InMemoryProductRepository implements IProductRepository {
  async create(product: Product): Promise<Product> {
    this.products.push(product);
    return product;
  }
}
```

4. **Presentación** - Endpoint:
```typescript
@Post()
create(@Body() dto: CreateProductDto) {
  return this.createProductUseCase.execute(dto);
}
```

### Cambiar de InMemory a Prisma:

```typescript
// 1. Crear nuevo adaptador
@Injectable()
class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}
  
  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products.map(this.toDomain);
  }
  
  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product ? this.toDomain(product) : null;
  }
  
  private toDomain(data: any): Product {
    return new Product(
      data.id,
      data.name,
      data.description,
      data.price,
      data.stock,
      data.createdAt,
      data.updatedAt,
    );
  }
}

// 2. Cambiar en products.module.ts
{
  provide: PRODUCT_REPOSITORY,
  useClass: PrismaProductRepository,  // ← Solo cambiar aquí
}
```

✨ **Todo el resto del código sigue funcionando sin cambios!**
