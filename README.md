# Products Management - Arquitectura Hexagonal

Proyecto NestJS implementando **Arquitectura Hexagonal** (Puertos y Adaptadores) para gestión de productos.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Compilar el proyecto
npm run build

# Modo desarrollo
npm run start:dev

# Modo producción
npm run start:prod
```

El servidor inicia en: `http://localhost:3000`

## 📋 API Endpoints

### GET /products
Obtiene todos los productos.

**Ejemplo:**
```bash
curl http://localhost:3000/products
```

**Respuesta:**
```json
[
  {
    "id": "1",
    "name": "Laptop Dell XPS 15",
    "description": "Laptop de alto rendimiento con procesador Intel i7",
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
Obtiene un producto por ID.

**Ejemplo:**
```bash
curl http://localhost:3000/products/1
```

**Respuesta (éxito):**
```json
{
  "id": "1",
  "name": "Laptop Dell XPS 15",
  "description": "Laptop de alto rendimiento con procesador Intel i7",
  "price": 1299.99,
  "stock": 15,
  "available": true,
  "totalValue": 19499.85,
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

**Respuesta (error):**
```json
{
  "message": "Product with ID 999 not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## 🏗️ Estructura del Proyecto

```
src/
├── products/                        # Módulo de Productos
│   ├── domain/                      # 🎯 DOMINIO (Núcleo)
│   │   ├── entities/
│   │   │   └── product.entity.ts   # Entidad con lógica de negocio
│   │   └── ports/                   # 🔌 PUERTOS (Interfaces)
│   │       ├── inbound/             # Puertos de Entrada
│   │       │   └── product-use-cases.port.ts
│   │       └── outbound/            # Puertos de Salida
│   │           └── product.repository.port.ts
│   │
│   ├── application/                 # 📋 APLICACIÓN (Casos de Uso)
│   │   ├── use-cases/
│   │   │   ├── get-all-products.use-case.ts
│   │   │   └── get-product-by-id.use-case.ts
│   │   └── dto/
│   │       └── product.dto.ts
│   │
│   └── infrastructure/              # 🔧 INFRAESTRUCTURA (Adaptadores)
│       ├── inbound/                 # Adaptadores de Entrada
│       │   └── http/
│       │       └── product-http.controller.ts
│       └── outbound/                # Adaptadores de Salida
│           └── persistence/
│               └── in-memory-product.repository.adapter.ts
│
├── app.module.ts                   # Módulo raíz
└── main.ts                         # Punto de entrada
```

## 📚 Documentación Detallada

Para más información sobre la arquitectura hexagonal implementada, consulta:

- **[PORTS_AND_ADAPTERS.md](PORTS_AND_ADAPTERS.md)** - Guía completa de Puertos y Adaptadores
- **[src/products/README.md](src/products/README.md)** - Documentación del módulo de productos
- **[HEXAGONAL_ARCHITECTURE.md](HEXAGONAL_ARCHITECTURE.md)** - Diagramas y conceptos generales

## 🎯 Arquitectura Hexagonal

### Puertos y Adaptadores - Visualización

```
         ┌───────────────────────────────────────────┐
         │    ADAPTADORES DE ENTRADA                 │
         │    (Inbound Adapters)                     │
         │  • ProductHttpController                  │
         │  • GraphQLResolver (futuro)               │
         └─────────────────┬─────────────────────────┘
                           │ usa
                ┌──────────▼──────────┐
                │  PUERTOS DE ENTRADA │  ← Interfaces
                │  (Inbound Ports)    │
                │  • IGetAllProducts  │
                │  • IGetProductById  │
                └──────────┬──────────┘
                           │ implementa
         ┌─────────────────▼─────────────────────────┐
         │    APLICACIÓN (Use Cases)                 │
         │  • GetAllProductsUseCase                  │
         │  • GetProductByIdUseCase                  │
         └─────────────────┬─────────────────────────┘
                           │ usa
                ┌──────────▼──────────┐
                │  PUERTOS DE SALIDA  │  ← Interfaces
                │  (Outbound Ports)   │
                │  • IProductRepo     │
                └──────────┬──────────┘
                           │ implementa
         ┌─────────────────▼─────────────────────────┐
         │    ADAPTADORES DE SALIDA                  │
         │    (Outbound Adapters)                    │
         │  • InMemoryProductRepoAdapter             │
         │  • PrismaProductRepoAdapter (futuro)      │
         └───────────────────────────────────────────┘
```

### Ventajas
adaptador (ej. `PrismaProductRepositoryAdapter`)
2. Implementar `IProductRepository`
3. Cambiar en `products.module.ts`:

```typescript
{
  provide: PRODUCT_REPOSITORY,
  useClass: PrismaProductRepositoryAdapter,  // ← Solo cambiar aquí
}
```

Todo el resto del código sigue funcionando sin cambios!

### Agregar Nuevas Operaciones (POST, PUT, DELETE)

1. Agregar método en puerto de salida `IProductRepository`
2. Implementar en el adaptador concreto (`InMemoryProductRepositoryAdapter`)
3. Crear nueva interfaz en puerto de entrada (ej. `ICreateProductUseCase`)
4. Crear nuevo caso de uso que implemente el puerto
5. Usar el caso de uso desde el adaptador HTTP (controller)  // ← Solo cambiar aquí
}
```

Todo el resto del código sigue funcionando sin cambios!

### Agregar Nuevas Operaciones (POST, PUT, DELETE)

1. Agregar método en `IProductRepository`
2. Implementar en el repositorio concreto
3. Crear nuevo caso de uso
4. Agregar endpoint en el controller

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Scripts Disponibles

```bash
npm run start         # Iniciar aplicación
npm run start:dev     # Modo desarrollo (watch)
npm run start:debug   # Modo debug
npm run build         # Compilar TypeScript
npm run format        # Formatear código
npm run lint          # Linter
npm test              # Tests
```

## 📦 Tecnologías

- **NestJS** - Framework Node.js
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **Jest** - Testing framework

## 🎓 Conceptos Clave

- **Arquitectura Hexagonal**: Separación entre lógica de negocio e infraestructura
- **Puertos**: Interfaces que definen contratos (ej. `IProductRepository`)
- **Adaptadores**: Implementaciones concretas de los puertos (ej. `InMemoryProductRepository`)
- **Casos de Uso**: Lógica de aplicación que orquesta el dominio
- **Inversión de Dependencias**: Las capas externas dependen de interfaces del dominio

## 📄 Licencia

UNLICENSED - Proyecto de ejemplo educativo
