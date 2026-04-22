# Integración MongoDB con Arquitectura Hexagonal

## 📋 Resumen

Este proyecto implementa un CRUD completo de productos utilizando:
- **Arquitectura Hexagonal** (Ports & Adapters)
- **MongoDB** como base de datos
- **Mongoose** como ODM
- **Validaciones** con class-validator y class-transformer
- **NestJS** como framework

## 🏗️ Estructura del Proyecto

```
src/products/
├── domain/                          # Núcleo del negocio (sin dependencias)
│   ├── entities/
│   │   └── product.entity.ts        # Entidad Product con lógica de negocio
│   └── ports/
│       ├── inbound/                 # Contratos de casos de uso
│       │   └── product-use-cases.port.ts
│       └── outbound/                # Contratos de persistencia
│           └── product.repository.port.ts
│
├── application/                     # Lógica de aplicación
│   ├── dto/
│   │   ├── product.dto.ts           # DTO de respuesta
│   │   └── create-product.dto.ts    # DTOs con validaciones
│   └── use-cases/
│       ├── get-all-products.use-case.ts
│       ├── get-product-by-id.use-case.ts
│       ├── create-product.use-case.ts
│       ├── update-product.use-case.ts
│       └── delete-product.use-case.ts
│
└── infrastructure/                  # Implementaciones concretas
    ├── inbound/                     # Adaptadores de entrada
    │   └── http/
    │       └── product-http.controller.ts
    └── outbound/                    # Adaptadores de salida
        └── persistence/
            ├── schemas/
            │   └── product.schema.ts
            ├── mongoose-product.repository.adapter.ts
            └── in-memory-product.repository.adapter.ts
```

## 🔄 Flujo de Datos

### 1. Crear Producto (POST /products)
```
HTTP Request
    ↓
ProductHttpController (@Body CreateProductDto)
    ↓
ValidationPipe (valida el DTO)
    ↓
CreateProductUseCase.execute(dto)
    ↓
- Verifica duplicados (findAll)
- Crea entidad Product con UUID
- product.validate() (validaciones de dominio)
    ↓
MongooseProductRepositoryAdapter.create(product)
    ↓
MongoDB (colección 'products')
    ↓
Respuesta: ProductDto
```

### 2. Obtener Todos los Productos (GET /products)
```
HTTP Request
    ↓
ProductHttpController
    ↓
GetAllProductsUseCase.execute()
    ↓
MongooseProductRepositoryAdapter.findAll()
    ↓
MongoDB
    ↓
Convierte ProductDocument → Product (entity)
    ↓
Convierte Product → ProductDto
    ↓
Respuesta: ProductDto[]
```

### 3. Actualizar Producto (PUT /products/:id)
```
HTTP Request
    ↓
ProductHttpController (@Param id, @Body UpdateProductDto)
    ↓
ValidationPipe (valida el DTO)
    ↓
UpdateProductUseCase.execute(id, dto)
    ↓
- Verifica existencia (findById)
- Si no existe → NotFoundException
    ↓
MongooseProductRepositoryAdapter.update(id, dto)
    ↓
MongoDB (actualiza timestamps automáticamente)
    ↓
Respuesta: ProductDto
```

### 4. Eliminar Producto (DELETE /products/:id)
```
HTTP Request
    ↓
ProductHttpController (@Param id)
    ↓
DeleteProductUseCase.execute(id)
    ↓
- Verifica existencia (findById)
- Si no existe → NotFoundException
    ↓
MongooseProductRepositoryAdapter.delete(id)
    ↓
MongoDB (elimina documento)
    ↓
Respuesta: 204 No Content
```

## ✅ Validaciones Implementadas

### CreateProductDto
```typescript
name: 
  - @IsString(): Debe ser texto
  - @IsNotEmpty(): No puede estar vacío
  - @MinLength(3): Mínimo 3 caracteres
  - @MaxLength(100): Máximo 100 caracteres

description:
  - @IsString(): Debe ser texto
  - @IsNotEmpty(): No puede estar vacío
  - @MinLength(10): Mínimo 10 caracteres
  - @MaxLength(500): Máximo 500 caracteres

price:
  - @IsNumber(): Debe ser numérico
  - @IsNotEmpty(): No puede estar vacío
  - @Min(0): No puede ser negativo

stock:
  - @IsNumber(): Debe ser numérico
  - @IsNotEmpty(): No puede estar vacío
  - @Min(0): No puede ser negativo
  - @Type(() => Number): Conversión automática
```

### UpdateProductDto
- Todos los campos son **@IsOptional()**
- Mantiene las mismas validaciones cuando el campo está presente

### Validaciones de Dominio (Product Entity)
```typescript
validate():
  - name: no vacío, entre 3 y 100 caracteres
  - description: no vacío, entre 10 y 500 caracteres
  - price: no negativo
  - stock: no negativo, número entero
```

### Validaciones de Base de Datos (Product Schema)
```typescript
name:
  - required: true
  - unique: true (nombre único en BD)
  - trim: true
  - minlength: 3
  - maxlength: 100

description:
  - required: true
  - minlength: 10
  - maxlength: 500

price:
  - required: true
  - min: 0

stock:
  - required: true
  - min: 0

timestamps: true (createdAt, updatedAt automáticos)
```

## 🚀 Configuración e Instalación

### 1. Instalar Dependencias
```bash
cd products-management
npm install
```

### 2. Configurar Variables de Entorno
Crear archivo `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/products-management
```

### 3. Iniciar MongoDB
```bash
# Con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# O con MongoDB instalado localmente
mongod
```

### 4. Poblar Base de Datos (Opcional)
```bash
npx ts-node src/seed.ts
```

### 5. Iniciar Aplicación
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📡 Endpoints API

### GET /products
Obtiene todos los productos.

**Respuesta:**
```json
[
  {
    "id": "uuid",
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
Obtiene un producto específico.

**Respuesta 200:**
```json
{
  "id": "uuid",
  "name": "Mouse Logitech MX Master 3",
  "description": "Mouse ergonómico...",
  "price": 99.99,
  "stock": 50,
  "available": true,
  "totalValue": 4999.50,
  "createdAt": "2024-02-10T00:00:00.000Z",
  "updatedAt": "2024-02-10T00:00:00.000Z"
}
```

**Respuesta 404:**
```json
{
  "statusCode": 404,
  "message": "Product with ID xxx not found",
  "error": "Not Found"
}
```

### POST /products
Crea un nuevo producto.

**Body:**
```json
{
  "name": "Teclado Mecánico",
  "description": "Teclado mecánico con switches Cherry MX",
  "price": 129.99,
  "stock": 20
}
```

**Respuesta 201:**
```json
{
  "id": "nuevo-uuid",
  "name": "Teclado Mecánico",
  "description": "Teclado mecánico con switches Cherry MX",
  "price": 129.99,
  "stock": 20,
  "available": true,
  "totalValue": 2599.80,
  "createdAt": "2024-04-16T00:00:00.000Z",
  "updatedAt": "2024-04-16T00:00:00.000Z"
}
```

**Respuesta 400 (Validación):**
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

**Respuesta 409 (Duplicado):**
```json
{
  "statusCode": 409,
  "message": "Ya existe un producto con el nombre \"Teclado Mecánico\"",
  "error": "Conflict"
}
```

### PUT /products/:id
Actualiza un producto existente.

**Body:**
```json
{
  "price": 119.99,
  "stock": 25
}
```

**Respuesta 200:**
```json
{
  "id": "uuid",
  "name": "Teclado Mecánico",
  "description": "Teclado mecánico con switches Cherry MX",
  "price": 119.99,
  "stock": 25,
  "available": true,
  "totalValue": 2999.75,
  "createdAt": "2024-04-16T00:00:00.000Z",
  "updatedAt": "2024-04-16T10:30:00.000Z"
}
```

**Respuesta 404:**
```json
{
  "statusCode": 404,
  "message": "Product with ID xxx not found",
  "error": "Not Found"
}
```

### DELETE /products/:id
Elimina un producto.

**Respuesta 204:** Sin contenido

**Respuesta 404:**
```json
{
  "statusCode": 404,
  "message": "Product with ID xxx not found",
  "error": "Not Found"
}
```

## 🔍 Ventajas de la Arquitectura Hexagonal

### 1. Independencia de la Base de Datos
Cambiar de MongoDB a PostgreSQL solo requiere:
- Crear nuevo adaptador: `PostgresProductRepositoryAdapter`
- Cambiar en `products.module.ts`:
  ```typescript
  {
    provide: PRODUCT_REPOSITORY,
    useClass: PostgresProductRepositoryAdapter, // ← Solo esto cambia
  }
  ```

### 2. Testabilidad
```typescript
// Test unitario con mock
const mockRepo = {
  findAll: jest.fn().mockResolvedValue([...]),
};

const useCase = new GetAllProductsUseCase(mockRepo);
```

### 3. Múltiples Interfaces
Agregar GraphQL sin tocar lógica:
```
infrastructure/inbound/
├── http/
│   └── product-http.controller.ts
└── graphql/
    └── product.resolver.ts  ← Nueva interfaz
```

### 4. Reutilización
Los mismos casos de uso sirven para:
- API REST
- GraphQL
- WebSockets
- Colas de mensajes
- CLI

## 🧪 Pruebas con cURL

```bash
# Crear producto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor Samsung 27\"",
    "description": "Monitor Full HD con panel IPS y 75Hz",
    "price": 299.99,
    "stock": 12
  }'

# Obtener todos
curl http://localhost:3000/products

# Obtener uno
curl http://localhost:3000/products/{id}

# Actualizar
curl -X PUT http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"price": 279.99}'

# Eliminar
curl -X DELETE http://localhost:3000/products/{id}
```

## 📦 Dependencias Principales

```json
{
  "@nestjs/mongoose": "^10.1.0",
  "mongoose": "^8.9.3",
  "class-validator": "^0.14.1",
  "class-transformer": "^0.5.1",
  "dotenv": "^16.4.7",
  "joi": "^17.14.0",
  "uuid": "^11.0.5"
}
```

## 🎯 Próximos Pasos

1. **Paginación**: Agregar `?page=1&limit=10` en GET /products
2. **Filtros**: Agregar `?search=laptop&minPrice=100&maxPrice=1000`
3. **Soft Delete**: En lugar de eliminar, marcar como `deleted: true`
4. **Caché**: Agregar Redis para consultas frecuentes
5. **Eventos**: Emitir eventos de dominio cuando cambia un producto
6. **Autenticación**: Proteger endpoints con JWT
7. **Swagger**: Documentar API con `@nestjs/swagger`

## 📝 Notas Importantes

- Los IDs son **UUID v4** generados automáticamente
- Los nombres son **únicos** (índice en MongoDB)
- Los timestamps (`createdAt`, `updatedAt`) se manejan automáticamente
- El campo `available` se calcula en base a `stock > 0`
- El campo `totalValue` se calcula como `price * stock`
- Las validaciones ocurren en **3 niveles**: DTO, Dominio y Base de Datos
