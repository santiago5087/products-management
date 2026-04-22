# Módulo de Productos - Arquitectura Hexagonal (Puertos y Adaptadores)

## 📐 Estructura del Proyecto

Este módulo sigue los principios de **Arquitectura Hexagonal** (también conocida como Puertos y Adaptadores), organizando el código en capas bien definidas con **separación explícita entre Puertos y Adaptadores**:

```
products/
├── domain/                          # 🎯 DOMINIO (Núcleo del Negocio)
│   ├── entities/
│   │   └── product.entity.ts       # Entidad de dominio con lógica de negocio
│   └── ports/                       # 🔌 PUERTOS (Interfaces)
│       ├── inbound/                 # Puertos de Entrada (Primary Ports)
│       │   └── product-use-cases.port.ts
│       └── outbound/                # Puertos de Salida (Secondary Ports)
│           └── product.repository.port.ts
│
├── application/                     # 📋 APLICACIÓN (Casos de Uso)
│   ├── use-cases/
│   │   ├── get-all-products.use-case.ts
│   │   └── get-product-by-id.use-case.ts
│   └── dto/
│       └── product.dto.ts
│
└── infrastructure/                  # 🔧 INFRAESTRUCTURA (Adaptadores)
    ├── inbound/                     # Adaptadores de Entrada (Primary Adapters)
    │   └── http/
    │       └── product-http.controller.ts
    └── outbound/                    # Adaptadores de Salida (Secondary Adapters)
        └── persistence/
            └── in-memory-product.repository.adapter.ts
```

## 🎯 Arquitectura Hexagonal - Puertos y Adaptadores

### 🔌 Puertos (Interfaces)

Los **puertos** son interfaces que definen contratos. Hay dos tipos:

#### **Puertos de Entrada (Inbound/Primary Ports)**
Son interfaces que la aplicación **expone** al mundo exterior.
- Ubicación: `domain/ports/inbound/`
- Implementados por: Casos de Uso (Application Layer)
- Usados por: Adaptadores de Entrada (Controllers, CLI, etc.)

**Ejemplo:**
```typescript
// domain/ports/inbound/product-use-cases.port.ts
export interface **Implementan puertos de entrada** y **usan puertos de salida**
  - `GetAllProductsUseCase`: Implementa `IGetAllProductsUseCase` y usa `IProductRepository`
  - `GetProductByIdUseCase`: Implementa `IGetProductByIdUseCase` y usa `IProductRepository`
- **DTOs**: Objetos para transferir datos entre capas

**Regla**: Depende SOLO de puertos (interfaces), nunca de adaptadores concretos.

### 3. **Adapters (Adaptadores)** - Conexiones con el Mundo Exterior

#### **Inbound Adapters** (Entrada)
Puntos de entrada a la aplicación desde el exterior.

- **HTTP**: Controladores REST
  - `ProductHttpController`: Expone endpoints HTTP y usa casos de uso
- Otros posibles: GraphQL Resolvers, CLI Commands, Message Consumers

**Regla**: Usan puertos de entrada (casos de uso), NO conocen el dominio directamente.

#### **Outbound Adapters** (Salida)
Implementaciones de infraestructura que la aplicación necesita.

- **Persistence**: Implementaciones de repositorios
  - `InMemoryProductRepositoryAdapter`: Implementa `IProductRepository` en memoria
  - Fácilmente reemplazable por: `PrismaProductRepositoryAdapter`, `TypeOrmProductRepositoryAdapter`, etc.

**Regla**: Implementan puertos de salida del domini de los puertos.

#### **Adaptadores de Entrada (Inbound/Primary Adapters)**
Conectan el mundo exterior con la aplicación.
- Ubicación: `infrastructure/inbound/`
- **USAN** los puertos de entrada (casos de uso)
- Ejemplos: HTTP Controllers, GraphQL Resolvers, CLI Commands, Message Consumers

**Ejemplo:**
```typescript
// infrastructure/inbound/http/product-http.controller.ts
@Controller('products')
export class ProductHttpController {
  constructor(
    @Inject(GET_ALL_PRODUCTS_USE_CASE)
    private getAllProductsUseCase: IGetAllProductsUseCase
  ) {}
}
```

#### **Adaptadores de Salida (Outbound/Secondary Adapters)**
Implementan la infraestructura que la aplicación necesita.
- Ubicación: `infrastructure/outbound/`
- **IMPLEMENTAN** los puertos de salida
- Ejemplos: Database Repositories, HTTP Clients, Message Publishers

**Ejemplo:**
```typescript
// infrastructure/outbound/persistence/in-memory-product.repository.adapter.ts
export class InMemoryProductRepositoryAdapter implements IProductRepository {
  async findAll(): Promise<Product[]> { /* ... */ }
}
```

### 1. **Domain (Dominio)** - El Núcleo
La capa más interna y pura, sin dependencias externas.

- **Entities**: Modelos de dominio con lógica de negocio
  - `Product`: Entidad con validaciones y métodos de negocio
- **Ports**: Interfaces que definen contratos
  - `Inbound Ports`: Interfaces de casos de uso
  - `Outbound Ports`: Interfaces de repositorios y servicios externos

**Regla**: El dominio NO conoce las capas externas.

### 2. **Application (Aplicación)** - Casos de Uso
Orquesta la lógica de aplicación usando el dominio.

- **Use Cases**: Implementan la lógica de aplicación
  - `GetAllProductsUseCase`: Obtiene todos los productos
  - `GetProductByIdUseCase`: Obtiene un producto por ID
- **DTOs**: Objetos para transferir datos entre capas

**Regla**: Usa puertos (interfaces) del dominio, no implementaciones concretas.

### 3. **Infrastructure (Infraestructura)** - Adaptadores
Implementaciones concretas de los puertos definidos en el dominio.

- **Persistence**: Implementaciones de repositorios
  - `InMemoryProductRepository`: Implementación en memoria (ejemplo)
  - En producción: `PrismaProductRepository`, `TypeOrmProductRepository`, etc.

**Regla**: Implementa las interfaces del dominio.

### 4. **Presentation (Presentación)** - Controladores
Punto de entrada para peticiones HTTP.

- **Controllers**: Exponen endpoints REST
  - `ProductController`: Maneja peticiones HTTP para productos
 - Puertos y Adaptadores

```
                    HTTP Request
                         ↓
┌────────────────────────────────────────────────────────────────┐
│  ADAPTADOR DE ENTRADA (Inbound Adapter)                        │
│  ProductHttpController                                         │
│  • Recibe petición HTTP                                        │
│  • Usa puerto de entrada (IGetProductByIdUseCase)             │
└────────────────────────┬───────────────────────────────────────┘
                         ↓  usa
           ┌─────────────────────────────┐
           │  PUERTO DE ENTRADA           │  ← Interface
           │  IGetProductByIdUseCase      │
           └─────────────┬───────────────┘
                         ↓  implementa
┌────────────────────────────────────────────────────────────────┐
│  APLICACIÓN (Application)                                      │
│  GetProductByIdUseCase                                         │
│  • Implementa puerto de entrada                                │
│  • Ejecuta lógica de negocio                                   │
│  • Usa puerto de salida (IProductRepository)                   │
└────────────────────────┬───────────────────────────────────────┘
                         ↓  usa
           ┌─────────────────────────────┐
           │  PUERTO DE SALIDA            │  ← Interface
           │  IProductRepository          │
           └─────────────┬───────────────┘
                         ↓  implementa
┌────────────────────────────────────────────────────────────────┐
│  ADAPTADOR DE SALIDA (Outbound Adapter)                        │
│  InMemoryProductRepositoryAdapter                              │
│  • Implementa puerto de salida                                 │
│  • Accede a la persistencia                                    │
└────────────────────────┬───────────────────────────────────────┘
                         ↓  retorna
           ┌─────────────────────────────┐
           │  DOMINIO (Domain)            │
           │  Product Entity              │
           └─────────────┬───────────────┘
                         ↓  transforma a
                    [ProductDto]
                         ↓
                   HTTP Response
```

### 🔑 Conceptos Clave:

- **Puerto de Entrada** → Interface que la app EXPONE (usado por adaptadores inbound)
- **Puerto de Salida** → Interface que la app REQUIERE (implementado por adaptadores outbound)
- **Adaptador de Entrada** → Usa puertos de entrada (HTTP, CLI, GraphQL)
- **Adaptador de Salida** → Implementa puertos de salida (DB, APIs externas)oductDto] (Application)
    ↓
HTTP Response
```

## 🚀 Endpoints Disponibles

### GET /products
Obtiene todos los productos.

**Respuesta:**
```json
[
  {
    "id": "1",
    "name": "Laptop Dell XPS 15",
    "description": "Laptop de alto rendimiento...",
    "price": 1299.99,
    "stock": 15,
    "available": true,
    "totalValue": 19499.85,
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]
```

### GET /products/:id
Obtiene un producto específico por ID.

**Respuesta:**
```json
{
  "id": "1",
  "name": "Laptop Dell XPS 15",
  "description": "Laptop de alto rendimiento...",
  "price": 1299.99,
  "stock": 15,
  "available": true,
  "totalValue": 19499.85,
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

## ✅ Ventajas de esta Arquitectura

1. **Independencia de Frameworks**: El dominio no depende de NestJS
2. **Testeable**: Cada capa puede testearse independientemente
3. **Flexible**: Fácil cambiar de base de datos (InMemory → Prisma → TypeORM)
4. **Mantenible**: Separación clara de responsabilidades
5. **Escalable**: Fácil agregar nuevos casos de uso o adaptadores

## 🔧 Cómo Extender

### Agregar un nuevo caso de uso (POST, PUT, DELETE):
1. Agregar método en `IProductRepository`
2. Implementar en `InMemoryProductRepository`
3. Crear nuevo use case en `application/use-cases/`
4. Agregar endpoint en `ProductController`

### Cambiar a base de datos real:
1. Crear `PrismaProductRepository` implementando `IProductRepository`
2. Actualizar `products.module.ts`:
```typescript
{
  provide: PRODUCT_REPOSITORY,
  useClass: PrismaProductRepository, // ← Cambiar aquí
}
```

## 📚 Principios Aplicados

- ✅ **Dependency Inversion Principle (DIP)**: Las capas externas dependen de interfaces del dominio
- ✅ **Single Responsibility Principle (SRP)**: Cada clase tiene una única responsabilidad
- ✅ **Open/Closed Principle**: Abierto para extensión, cerrado para modificación
- ✅ **Ports & Adapters**: Puertos (interfaces) y Adaptadores (implementaciones)
