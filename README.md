# Products Management - Arquitectura Hexagonal

Proyecto NestJS implementando **Arquitectura Hexagonal** (Puertos y Adaptadores) con **MongoDB** para gestión completa de productos (CRUD).

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar MongoDB (con Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Poblar base de datos con datos de ejemplo
npx ts-node src/seed.ts

# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

El servidor inicia en: `http://localhost:3000`

## 📋 API Endpoints - CRUD Completo

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
    "id": "uuid-123",
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
curl http://localhost:3000/products/uuid-123
```

**Respuesta (200 OK):**
```json
{
  "id": "uuid-123",
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

**Respuesta (404 Not Found):**
```json
{
  "message": "Product with ID xxx not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### POST /products
Crea un nuevo producto.

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teclado Mecánico",
    "description": "Teclado mecánico con switches Cherry MX",
    "price": 129.99,
    "stock": 20
  }'
```

**Validaciones:**
- `name`: requerido, 3-100 caracteres
- `description`: requerido, 10-500 caracteres
- `price`: requerido, número >= 0
- `stock`: requerido, número >= 0

**Respuesta (201 Created):**
```json
{
  "id": "uuid-nuevo",
  "name": "Teclado Mecánico",
  "description": "Teclado mecánico con switches Cherry MX",
  "price": 129.99,
  "stock": 20,
  "available": true,
  "totalValue": 2599.80,
  "createdAt": "2024-04-22T00:00:00.000Z",
  "updatedAt": "2024-04-22T00:00:00.000Z"
}
```

**Respuesta (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 3 characters",
    "price must not be less than 0"
  ],
  "error": "Bad Request"
}
```

**Respuesta (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "Ya existe un producto con el nombre \"Teclado Mecánico\"",
  "error": "Conflict"
}
```

### PUT /products/:id
Actualiza un producto existente (actualización parcial).

**Ejemplo:**
```bash
curl -X PUT http://localhost:3000/products/uuid-123 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 119.99,
    "stock": 25
  }'
```

**Nota:** Todos los campos son opcionales en la actualización.

**Respuesta (200 OK):**
```json
{
  "id": "uuid-123",
  "name": "Teclado Mecánico",
  "description": "Teclado mecánico con switches Cherry MX",
  "price": 119.99,
  "stock": 25,
  "available": true,
  "totalValue": 2999.75,
  "createdAt": "2024-04-22T00:00:00.000Z",
  "updatedAt": "2024-04-22T10:30:00.000Z"
}
```

**Respuesta (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Product with ID xxx not found",
  "error": "Not Found"
}
```

### DELETE /products/:id
Elimina un producto.

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/products/uuid-123
```

**Respuesta (204 No Content):**
Sin contenido (eliminación exitosa)

**Respuesta (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Product with ID xxx not found",
  "error": "Not Found"
}
```
```

## 🏗️ Estructura del Proyecto

```
src/
├── config/                          # Configuración
│   ├── envs.ts                      # Variables de entorno
│   ├── database.config.ts           # Configuración MongoDB
│   └── index.ts
│
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
│   │   │   ├── get-product-by-id.use-case.ts
│   │   │   ├── create-product.use-case.ts
│   │   │   ├── update-product.use-case.ts
│   │   │   └── delete-product.use-case.ts
│   │   └── dto/
│   │       ├── product.dto.ts
│   │       └── create-product.dto.ts    # DTOs con validaciones
│   │
│   └── infrastructure/              # 🔧 INFRAESTRUCTURA (Adaptadores)
│       ├── inbound/                 # Adaptadores de Entrada
│       │   └── http/
│       │       └── product-http.controller.ts
│       └── outbound/                # Adaptadores de Salida
│           └── persistence/
│               ├── schemas/
│               │   └── product.schema.ts
│               ├── mongoose-product.repository.adapter.ts
│               └── in-memory-product.repository.adapter.ts
│
├── seed.ts                         # Script de seed de BD
├── clear-db.ts                     # Script para limpiar BD
├── app.module.ts                   # Módulo raíz
└── main.ts                         # Punto de entrada
```

## 📚 Documentación Detallada

Para más información sobre la implementación, consulta:

- **[MONGODB_INTEGRATION.md](MONGODB_INTEGRATION.md)** - Guía completa de integración con MongoDB
- **[PORTS_AND_ADAPTERS.md](PORTS_AND_ADAPTERS.md)** - Guía completa de Puertos y Adaptadores
- **[src/products/README.md](src/products/README.md)** - Documentación del módulo de productos
- **[HEXAGONAL_ARCHITECTURE.md](HEXAGONAL_ARCHITECTURE.md)** - Diagramas y conceptos generales

## 🎯 Arquitectura Hexagonal

### Puertos y Adaptadores - Visualización

```
         ┌───────────────────────────────────────────┐
         │    ADAPTADORES DE ENTRADA                 │
         │    (Inbound Adapters)                     │
         │  • ProductHttpController (REST API)       │
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
         │  • CreateProductUseCase                   │
         │  • UpdateProductUseCase                   │
         │  • DeleteProductUseCase                   │
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
         │  • MongooseProductRepositoryAdapter ✅    │
         │  • InMemoryProductRepositoryAdapter       │
         │  • PrismaProductRepositoryAdapter (fut.)  │
         └───────────────────┬───────────────────────┘
                             │
                    ┌────────▼────────┐
                    │    MongoDB      │
                    │  (Base de Datos)│
                    └─────────────────┘
```

### ✅ Validaciones Implementadas

**Nivel 1: DTOs (class-validator)**
- Validación automática en los endpoints
- Mensajes de error descriptivos
- Transformación de tipos

**Nivel 2: Entidad de Dominio**
- Reglas de negocio (ej: `isAvailable()`)
- Cálculos derivados (ej: `getTotalValue()`)
- Validaciones de consistencia

**Nivel 3: Base de Datos (MongoDB)**
- Restricciones únicas (nombre)
- Índices para optimización
- Validaciones de esquema

### Ventajas
### Ventajas de la Arquitectura

**1. Independencia de la Base de Datos**

Cambiar de MongoDB a PostgreSQL solo requiere crear un nuevo adaptador y cambiar una línea:

```typescript
// En products.module.ts
{
  provide: PRODUCT_REPOSITORY,
  useClass: PostgresProductRepositoryAdapter,  // ← Solo cambiar aquí
}
```

**2. Testabilidad**

Los casos de uso se pueden testear con mocks sin necesidad de BD:

```typescript
const mockRepo = {
  findAll: jest.fn().mockResolvedValue([...]),
};
const useCase = new GetAllProductsUseCase(mockRepo);
```

**3. Múltiples Interfaces**

Agregar GraphQL sin tocar la lógica de negocio:

```
infrastructure/inbound/
├── http/
│   └── product-http.controller.ts
└── graphql/
    └── product.resolver.ts  ← Nueva interfaz
```

**4. Reusabilidad**

Los mismos casos de uso funcionan con:
- API REST ✅
- GraphQL (agregar resolver)
- WebSockets (agregar gateway)
- Colas de mensajes (agregar consumer)
- CLI (agregar comandos)

### Cambiar de Base de Datos

Para cambiar de MongoDB a otra base de datos:

1. Crear nuevo adaptador (ej. `PrismaProductRepositoryAdapter`)
2. Implementar la interfaz `IProductRepository`
3. Cambiar en `products.module.ts`:

```typescript
{
  provide: PRODUCT_REPOSITORY,
  useClass: PrismaProductRepositoryAdapter,  // ← Solo cambiar aquí
}
```

¡Todo el resto del código sigue funcionando sin cambios!

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🧪 Pruebas con cURL

```bash
# Listar todos los productos
curl http://localhost:3000/products

# Obtener producto por ID
curl http://localhost:3000/products/{uuid}

# Crear producto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor Samsung 27\"",
    "description": "Monitor Full HD con panel IPS y 75Hz de refresco",
    "price": 299.99,
    "stock": 12
  }'

# Actualizar producto
curl -X PUT http://localhost:3000/products/{uuid} \
  -H "Content-Type: application/json" \
  -d '{"price": 279.99, "stock": 15}'

# Eliminar producto
curl -X DELETE http://localhost:3000/products/{uuid}
```

## 🔧 Troubleshooting

### MongoDB no conecta

**Problema**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solución**:
```bash
# Verificar que MongoDB está corriendo
docker ps | grep mongo

# O iniciar MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Productos no aparecen en Compass

**Problema**: La colección está vacía en MongoDB Compass

**Solución**:
1. Asegúrate de estar viendo la base de datos correcta: `products-management`
2. Busca la colección `products` (no `productdocuments`)
3. Ejecuta el seed: `npx ts-node src/seed.ts`
4. Presiona el botón Refresh en Compass

### Errores de validación

**Problema**: `Bad Request` al crear productos

**Solución**: Verifica que los datos cumplan las validaciones:
- `name`: 3-100 caracteres
- `description`: 10-500 caracteres
- `price` y `stock`: números >= 0

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run start         # Iniciar aplicación
npm run start:dev     # Modo desarrollo (watch)
npm run start:debug   # Modo debug
npm run build         # Compilar TypeScript

# Base de Datos
npx ts-node src/seed.ts      # Poblar BD con datos de ejemplo
npx ts-node src/clear-db.ts  # Limpiar base de datos

# Calidad de Código
npm run format        # Formatear código
npm run lint          # Linter

# Testing
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Test coverage
```

## 📦 Tecnologías

### Core
- **NestJS** ^11.0.1 - Framework Node.js
- **TypeScript** ^5.7.3 - Lenguaje de programación
- **RxJS** ^7.8.2 - Programación reactiva

### Base de Datos
- **MongoDB** - Base de datos NoSQL
- **Mongoose** ^8.9.3 - ODM para MongoDB
- **@nestjs/mongoose** ^10.1.0 - Integración NestJS + Mongoose

### Validación
- **class-validator** ^0.14.1 - Validación de DTOs
- **class-transformer** ^0.5.1 - Transformación de objetos

### Configuración
- **dotenv** ^16.4.7 - Variables de entorno
- **joi** ^17.14.0 - Validación de schemas

### Testing
- **Jest** - Testing framework
- **Supertest** - Testing E2E

### Utilidades
- **uuid** ^11.0.5 - Generación de IDs únicos

## 🎓 Conceptos Clave

### Arquitectura
- **Arquitectura Hexagonal**: Separación entre lógica de negocio e infraestructura
- **Puertos**: Interfaces que definen contratos (ej. `IProductRepository`)
- **Adaptadores**: Implementaciones concretas de los puertos (ej. `MongooseProductRepositoryAdapter`)
- **Casos de Uso**: Lógica de aplicación que orquesta el dominio
- **Inversión de Dependencias**: Las capas externas dependen de interfaces del dominio

### Patrones Implementados
- **Repository Pattern**: Abstracción de la capa de persistencia
- **Dependency Injection**: Inyección de dependencias con tokens
- **DTO Pattern**: Objetos de transferencia de datos con validaciones
- **Factory Pattern**: SchemaFactory para crear schemas de Mongoose

### Validaciones
- **3 niveles de validación**: DTO → Dominio → Base de Datos
- **Validación automática**: ValidationPipe global en NestJS
- **Mensajes descriptivos**: Errores claros para el consumidor del API

## 🔒 Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/products-management
```

Para MongoDB con autenticación:
```env
MONGODB_URI=mongodb://usuario:password@localhost:27017/products-management
```

## � Próximos Pasos

### Mejoras Sugeridas

1. **Paginación**
   ```typescript
   GET /products?page=1&limit=10
   ```

2. **Filtros y Búsqueda**
   ```typescript
   GET /products?search=laptop&minPrice=100&maxPrice=1000
   ```

3. **Ordenamiento**
   ```typescript
   GET /products?sortBy=price&order=desc
   ```

4. **Soft Delete**
   - En lugar de eliminar, marcar como `deleted: true`
   - Agregar endpoint para restaurar

5. **Caché con Redis**
   - Cachear consultas frecuentes
   - Invalidar caché en modificaciones

6. **Eventos de Dominio**
   - Emitir eventos cuando cambia un producto
   - Integrar con colas de mensajes

7. **Autenticación y Autorización**
   - Proteger endpoints con JWT
   - Roles y permisos

8. **Documentación API**
   - Swagger/OpenAPI con `@nestjs/swagger`
   - Ejemplos interactivos

9. **Logging**
   - Winston o Pino para logs estructurados
   - Correlación de requests

10. **Monitoreo**
    - Prometheus + Grafana
    - Health checks

## 📄 Licencia

UNLICENSED - Proyecto de ejemplo educativo

---

**Desarrollado con ❤️ usando NestJS y Arquitectura Hexagonal**
