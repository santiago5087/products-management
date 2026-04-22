# Arquitectura Hexagonal - Puertos y Adaptadores

## 🏗️ Estructura Visual del Proyecto

```
products/
│
├── domain/ ──────────────────────────────────────────────────────┐
│   │                      DOMINIO (Núcleo)                       │
│   │                                                              │
│   ├── entities/                                                 │
│   │   └── product.entity.ts ← Lógica de Negocio Pura           │
│   │                                                              │
│   └── ports/ ──────────────── 🔌 PUERTOS (Interfaces) ─────────┤
│       │                                                          │
│       ├── inbound/  ← PUERTOS DE ENTRADA (Primary Ports)       │
│       │   └── product-use-cases.port.ts                        │
│       │       • IGetAllProductsUseCase                         │
│       │       • IGetProductByIdUseCase                         │
│       │                                                          │
│       └── outbound/ ← PUERTOS DE SALIDA (Secondary Ports)      │
│           └── product.repository.port.ts                       │
│               • IProductRepository                             │
└──────────────────────────────────────────────────────────────────┘

├── application/ ─────────────────────────────────────────────────┐
│              APLICACIÓN (Casos de Uso)                          │
│                                                                  │
│   ├── use-cases/                                                │
│   │   ├── get-all-products.use-case.ts                         │
│   │   │   ✓ IMPLEMENTA puerto de entrada: IGetAllProducts      │
│   │   │   ✓ USA puerto de salida: IProductRepository           │
│   │   │                                                         │
│   │   └── get-product-by-id.use-case.ts                        │
│   │       ✓ IMPLEMENTA puerto de entrada: IGetProductById      │
│   │       ✓ USA puerto de salida: IProductRepository           │
│   │                                                             │
│   └── dto/                                                      │
│       └── product.dto.ts ← DTOs para transferencia             │
└──────────────────────────────────────────────────────────────────┘

└── infrastructure/ ────────────── 🔧 INFRAESTRUCTURA (Adaptadores) ───┐
    │                                                              │
    ├── inbound/ ← ADAPTADORES DE ENTRADA (Primary Adapters)     │
    │   │          Conectan el mundo exterior → aplicación        │
    │   │                                                          │
    │   └── http/                                                 │
    │       └── product-http.controller.ts                        │
    │           • @Controller('products')                         │
    │           • INYECTA puertos de entrada (casos de uso)       │
    │           • NO conoce el dominio directamente               │
    │                                                              │
    │   Otros posibles:                                           │
    │   ├── graphql/product.resolver.ts                           │
    │   ├── cli/product.command.ts                                │
    │   └── messaging/product.consumer.ts                         │
    │                                                              │
    └── outbound/ ← ADAPTADORES DE SALIDA (Secondary Adapters)   │
        │           Implementan infraestructura para la app       │
        │                                                          │
        └── persistence/                                          │
            └── in-memory-product.repository.adapter.ts           │
                • IMPLEMENTA puerto de salida: IProductRepository │
                • Maneja persistencia real                        │
                                                                   │
        Otros posibles:                                           │
        ├── prisma-product.repository.adapter.ts                  │
        ├── typeorm-product.repository.adapter.ts                 │
        └── external-api/product-api.adapter.ts                   │
└──────────────────────────────────────────────────────────────────┘
```

## 🎯 Conceptos Clave

### 🔌 Puertos (Ports)
**Son interfaces** que definen contratos. NO contienen implementación.

#### Puertos de Entrada (Inbound/Primary)
- **Definición**: Interfaces que la aplicación **EXPONE** al exterior
- **Ubicación**: `domain/ports/inbound/`
- **Implementados por**: Casos de Uso (Application Layer)
- **Usados por**: Adaptadores de Entrada (Controllers, Resolvers, etc.)
- **Dirección del flujo**: Exterior → Aplicación

**Ejemplo:**
```typescript
export interface IGetAllProductsUseCase {
  execute(): Promise<ProductDto[]>;
}
```

#### Puertos de Salida (Outbound/Secondary)
- **Definición**: Interfaces que la aplicación **REQUIERE** del exterior
- **Ubicación**: `domain/ports/outbound/`
- **Implementados por**: Adaptadores de Salida (Repositories, APIs, etc.)
- **Usados por**: Casos de Uso
- **Dirección del flujo**: Aplicación → Exterior

**Ejemplo:**
```typescript
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
}
```

### 🔧 Adaptadores (Adapters)
**Son implementaciones concretas** de los puertos. Contienen código real.

#### Adaptadores de Entrada (Inbound/Primary)
- **Definición**: Componentes que **USAN** la aplicación desde el exterior
- **Ubicación**: `infrastructure/inbound/`
- **Función**: Traducir peticiones externas a llamadas de casos de uso
- **Ejemplos**: HTTP Controllers, GraphQL Resolvers, CLI Commands

**Ejemplo:**
```typescript
@Controller('products')
export class ProductHttpController {
  constructor(
    @Inject(GET_ALL_PRODUCTS_USE_CASE)
    private getAllProductsUseCase: IGetAllProductsUseCase  // ← Usa puerto
  ) {}
  
  @Get()
  findAll() {
    return this.getAllProductsUseCase.execute();
  }
}
```

#### Adaptadores de Salida (Outbound/Secondary)
- **Definición**: Componentes que **IMPLEMENTAN** infraestructura para la aplicación
- **Ubicación**: `infrastructure/outbound/`
- **Función**: Implementar operaciones de infraestructura (DB, APIs, etc.)
- **Ejemplos**: Database Repositories, HTTP Clients, File Systems

**Ejemplo:**
```typescript
@Injectable()
export class InMemoryProductRepositoryAdapter implements IProductRepository {
  private products: Product[] = [...];
  
  async findAll(): Promise<Product[]> {
    return this.products;
  }
}
```

## 🔄 Flujo Completo de una Petición

```
1. Cliente HTTP
     │
     │ GET /products/1
     ↓
┌─────────────────────────────────────────┐
│ ADAPTADOR DE ENTRADA                    │
│ ProductHttpController                   │
│ • Recibe petición HTTP                  │
│ • Valida parámetros                     │
└─────────┬───────────────────────────────┘
          │
          │ .execute("1")
          ↓
┌─────────────────────────────────────────┐
│ PUERTO DE ENTRADA (Interface)           │
│ IGetProductByIdUseCase                  │
└─────────┬───────────────────────────────┘
          │
          │ implementado por
          ↓
┌─────────────────────────────────────────┐
│ CASO DE USO                             │
│ GetProductByIdUseCase                   │
│ • Orquesta lógica de aplicación        │
│ • Valida reglas de negocio              │
└─────────┬───────────────────────────────┘
          │
          │ .findById("1")
          ↓
┌─────────────────────────────────────────┐
│ PUERTO DE SALIDA (Interface)            │
│ IProductRepository                      │
└─────────┬───────────────────────────────┘
          │
          │ implementado por
          ↓
┌─────────────────────────────────────────┐
│ ADAPTADOR DE SALIDA                     │
│ InMemoryProductRepositoryAdapter        │
│ • Accede a la base de datos             │
│ • Convierte datos a entidades           │
└─────────┬───────────────────────────────┘
          │
          │ retorna Product Entity
          ↓
┌─────────────────────────────────────────┐
│ ENTIDAD DE DOMINIO                      │
│ Product                                 │
│ • isAvailable()                         │
│ • getTotalValue()                       │
└─────────┬───────────────────────────────┘
          │
          │ convertido a
          ↓
         ProductDto
          │
          │ retorna JSON
          ↓
    Cliente HTTP
```

## 💡 ¿Por qué esta separación?

### ✅ Ventajas de Puertos Explícitos

1. **Clara Separación de Responsabilidades**
   - Puertos = Contratos
   - Adaptadores = Implementaciones

2. **Inversión de Dependencias Real**
   - Todo depende de interfaces (puertos)
   - Nada depende de implementaciones (adaptadores)

3. **Facilita Testing**
   ```typescript
   // Mock del puerto de salida
   const mockRepo: IProductRepository = {
     findAll: jest.fn().mockResolvedValue([mockProduct])
   };
   
   // Test del caso de uso sin tocar infraestructura
   const useCase = new GetAllProductsUseCase(mockRepo);
   ```

4. **Facilita Cambios de Tecnología**
   ```typescript
   // Cambiar de InMemory a Prisma:
   {
     provide: PRODUCT_REPOSITORY,
     useClass: PrismaProductRepositoryAdapter  // ← Solo aquí
   }
   ```

5. **Documentación Viva**
   - Los puertos documentan qué necesita y qué ofrece la aplicación
   - Los adaptadores son detalles de implementación

### 📊 Comparación: Con vs Sin Puertos Explícitos

#### ❌ Sin Puertos Explícitos
```
Controller → UseCase → Repository (clase concreta)
```
- Difícil ver qué es interface vs implementación
- Acoplamiento implícito
- Testing complicado

#### ✅ Con Puertos Explícitos
```
Controller → IUseCase (puerto entrada) → UseCase
UseCase → IRepository (puerto salida) → Repository
```
- Clara separación de contratos
- Desacoplamiento explícito
- Testing simple

## 🔄 Reemplazar un Adaptador

### Ejemplo: De InMemory a Prisma

1. **Crear nuevo adaptador de salida:**
```typescript
// infrastructure/outbound/persistence/prisma-product.repository.adapter.ts
@Injectable()
export class PrismaProductRepositoryAdapter implements IProductRepository {
  constructor(private prisma: PrismaService) {}
  
  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products.map(this.toDomain);
  }
  
  private toDomain(data: any): Product {
    return new Product(
      data.id,
      data.name,
      data.description,
      data.price,
      data.stock,
      data.createdAt,
      data.updatedAt
    );
  }
}
```

2. **Cambiar en products.module.ts:**
```typescript
{
  provide: PRODUCT_REPOSITORY,
  useClass: PrismaProductRepositoryAdapter  // ← Solo cambiar aquí
}
```

3. **¡Listo!** Todo el resto sigue funcionando:
- ✅ Casos de uso: Sin cambios
- ✅ Controladores: Sin cambios
- ✅ Entidades: Sin cambios
- ✅ Tests: Sin cambios (solo los del adaptador)

## 🎓 Principios Aplicados

✅ **Dependency Inversion Principle (DIP)**
- Módulos de alto nivel no dependen de módulos de bajo nivel
- Ambos dependen de abstracciones (puertos)

✅ **Separation of Concerns**
- Dominio: Lógica de negocio
- Application: Orquestación
- Adapters: Detalles técnicos

✅ **Open/Closed Principle**
- Abierto para extensión: Agregar nuevos adaptadores
- Cerrado para modificación: Sin cambiar dominio/aplicación

✅ **Interface Segregation Principle**
- Puertos específicos y pequeños
- Cada adaptador implementa solo lo que necesita
