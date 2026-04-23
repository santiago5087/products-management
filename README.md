# Products Management - Arquitectura Hexagonal

Proyecto NestJS implementando **Arquitectura Hexagonal** (Puertos y Adaptadores) con **MongoDB** para gestión completa de productos (CRUD) y autenticación JWT.

## 🚀 Inicio Rápido

### 1. Clonar e Instalar Dependencias

```bash
# Instalar dependencias
npm install
```

### 2. Configurar MongoDB con Docker

**Opción A: MongoDB Standalone**
```bash
# Iniciar contenedor MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Verificar que está corriendo
docker ps | grep mongodb
```

**Opción B: Detener y Eliminar Contenedor (si ya existe)**
```bash
# Detener contenedor existente
docker stop mongodb

# Eliminar contenedor
docker rm mongodb

# Crear nuevo contenedor
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

**Comandos Útiles de Docker**
```bash
# Ver logs de MongoDB
docker logs mongodb

# Detener MongoDB
docker stop mongodb

# Iniciar MongoDB (si ya existe)
docker start mongodb

# Acceder a la consola de MongoDB
docker exec -it mongodb mongosh
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus valores:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/products-management

# JWT Configuration
JWT_SECRET=tu-secreto-super-seguro-cambiame-en-produccion
JWT_EXPIRES_IN=1d
```

⚠️ **IMPORTANTE**: Cambia `JWT_SECRET` en producción.

### 4. Poblar Base de Datos

```bash
# Crear usuario administrador
npx ts-node src/seed-admin.ts

# Poblar productos de ejemplo
npx ts-node src/seed.ts
```

Esto crea:
- **Usuario Admin**: `admin@example.com` / `admin123`
- **5 productos** de ejemplo

### 5. Iniciar Aplicación

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

El servidor inicia en: **http://localhost:3000**

### 6. Probar la API

Usa la **colección de Postman** incluida en los recursos enviados para probar todos los endpoints:
- 📁 `technical-test-Edhy-Santiago-Marin.postman_collection.json`

O accede directamente:
- **Health Check**: http://localhost:3000
- **Productos**: http://localhost:3000/products
- **Auth**: http://localhost:3000/auth/login

## 📋 API Endpoints

### Autenticación

| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|------------|
| `/auth/register` | POST | Registrar nuevo usuario | ❌ Público |
| `/auth/login` | POST | Iniciar sesión | ❌ Público |
| `/auth/profile` | GET | Obtener perfil del usuario autenticado | 🔒 JWT |

### Productos

| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|------------|
| `/products` | GET | Listar todos los productos | ❌ Público |
| `/products/:id` | GET | Obtener producto por ID | ❌ Público |
| `/products` | POST | Crear nuevo producto | 🔒 Admin |
| `/products/:id` | PUT | Actualizar producto | 🔒 Admin |
| `/products/:id` | DELETE | Eliminar producto | 🔒 Admin |

**Notas:**
- 🔒 **JWT**: Requiere token de autenticación
- 🔒 **Admin**: Requiere token JWT con rol `admin`
- Usa la colección de Postman para ejemplos detallados de cada endpoint

### Autenticación JWT

Para endpoints protegidos, incluir header:
```
Authorization: Bearer <tu-token-jwt>
```

**Flujo de autenticación:**
1. `POST /auth/login` → Obtener `access_token`
2. Incluir token en header `Authorization`
3. Acceder a endpoints protegidos

## 🏗️ Estructura del Proyecto

```
src/
├── config/                          # Configuración
│   ├── envs.ts                      # Variables de entorno validadas
│   ├── database.config.ts           # Configuración MongoDB con eventos
│   └── index.ts
│
├── auth/                            # 🔐 Módulo de Autenticación
│   ├── domain/
│   │   ├── entities/
│   │   │   └── user.entity.ts      # Entidad User con validaciones
│   │   └── ports/
│   │       ├── inbound/
│   │       │   └── auth-use-cases.port.ts
│   │       └── outbound/
│   │           ├── user.repository.port.ts
│   │           ├── token.service.port.ts
│   │           └── password.service.port.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── login.use-case.ts
│   │   │   ├── register.use-case.ts
│   │   │   └── validate-token.use-case.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       ├── auth-response.dto.ts
│   │       └── user.dto.ts
│   │
│   └── infrastructure/
│       ├── inbound/
│       │   ├── http/
│       │   │   └── auth.controller.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── roles.guard.ts
│       │   └── decorators/
│       │       ├── auth.decorator.ts       # @Auth() compuesto
│       │       ├── current-user.decorator.ts
│       │       └── roles.decorator.ts
│       └── outbound/
│           ├── persistence/
│           │   ├── schemas/
│           │   │   └── user.schema.ts
│           │   └── mongoose-user.repository.adapter.ts
│           ├── bcrypt-password.service.adapter.ts
│           └── jwt-token.service.adapter.ts
│
├── products/                        # 📦 Módulo de Productos
│   ├── domain/
│   │   ├── entities/
│   │   │   └── product.entity.ts   # Entidad Product con lógica de negocio
│   │   └── ports/
│   │       ├── inbound/
│   │       │   └── product-use-cases.port.ts
│   │       └── outbound/
│   │           └── product.repository.port.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── get-all-products.use-case.ts
│   │   │   ├── get-product-by-id.use-case.ts
│   │   │   ├── create-product.use-case.ts
│   │   │   ├── update-product.use-case.ts
│   │   │   └── delete-product.use-case.ts
│   │   └── dto/
│   │       ├── product.dto.ts
│   │       ├── create-product.dto.ts
│   │       └── update-product.dto.ts
│   │
│   └── infrastructure/
│       ├── inbound/
│       │   └── http/
│       │       └── product-http.controller.ts
│       └── outbound/
│           └── persistence/
│               ├── schemas/
│               │   └── product.schema.ts
│               └── mongoose-product.repository.adapter.ts
│
├── seed.ts                         # Script de seed de productos
├── seed-admin.ts                   # Script de seed de admin
├── clear-db.ts                     # Script para limpiar BD
├── app.module.ts                   # Módulo raíz
└── main.ts                         # Punto de entrada
```

## 📚 Documentación Detallada

- **[JWT_AUTHENTICATION.md](JWT_AUTHENTICATION.md)** - Guía completa de autenticación JWT con arquitectura hexagonal
- **[MONGODB_INTEGRATION.md](MONGODB_INTEGRATION.md)** - Integración con MongoDB y Mongoose
- **[HEXAGONAL_ARCHITECTURE.md](HEXAGONAL_ARCHITECTURE.md)** - Conceptos y diagramas de arquitectura hexagonal
- **Colección de Postman** - Ejemplos de todos los endpoints (`technical-test-Edhy-Santiago-Marin.postman_collection.json`)

## 🎯 Arquitectura Hexagonal

### Estructura de Capas

```
┌─────────────────────────────────────────────────────────┐
│                ADAPTADORES DE ENTRADA                   │
│              (Inbound Adapters / Primary)               │
│  • ProductHttpController (REST)                         │
│  • AuthController (REST)                                │
│  • JwtAuthGuard, RolesGuard (Seguridad)                │
└──────────────────────┬──────────────────────────────────┘
                       │ usa
            ┌──────────▼──────────┐
            │  PUERTOS DE ENTRADA │  ← Interfaces
            │  (Inbound Ports)    │
            │  • IGetAllProducts  │
            │  • ICreateProduct   │
            │  • ILoginUseCase    │
            │  • IRegisterUseCase │
            └──────────┬──────────┘
                       │ implementa
┌──────────────────────▼──────────────────────────────────┐
│               CAPA DE APLICACIÓN                        │
│              (Use Cases / Services)                     │
│  Productos:                                             │
│  • GetAllProductsUseCase                                │
│  • CreateProductUseCase, UpdateProductUseCase           │
│  Auth:                                                  │
│  • LoginUseCase, RegisterUseCase, ValidateTokenUseCase  │
└──────────────────────┬──────────────────────────────────┘
                       │ usa
            ┌──────────▼──────────┐
            │  PUERTOS DE SALIDA  │  ← Interfaces
            │  (Outbound Ports)   │
            │  • IProductRepo     │
            │  • IUserRepository  │
            │  • ITokenService    │
            │  • IPasswordService │
            └──────────┬──────────┘
                       │ implementa
┌──────────────────────▼──────────────────────────────────┐
│              ADAPTADORES DE SALIDA                      │
│            (Outbound Adapters / Secondary)              │
│  • MongooseProductRepositoryAdapter                     │
│  • MongooseUserRepositoryAdapter                        │
│  • JwtTokenServiceAdapter                               │
│  • BcryptPasswordServiceAdapter                         │
└──────────────────────┬──────────────────────────────────┘
                       │
            ┌──────────▼──────────┐
            │   INFRAESTRUCTURA   │
            │   • MongoDB         │
            │   • JWT / bcrypt    │
            └─────────────────────┘
```

### Principios Clave

**1. Independencia de Tecnología**
- El dominio no conoce MongoDB, JWT ni HTTP
- Cambiar de base de datos = cambiar un adaptador
- Mismo código funciona con REST, GraphQL, gRPC, etc.

**2. Flujo de Dependencias**
```
Adaptadores → Puertos → Casos de Uso → Dominio
  (Infra)    (Interfaces)  (Lógica)    (Entidades)
```

**3. Testabilidad**
- Casos de uso se testean con mocks
- No se necesita BD ni servidor HTTP
- Tests rápidos y confiables

**4. Separación de Responsabilidades**
- **Dominio**: Reglas de negocio puras
- **Aplicación**: Orquestación de casos de uso
- **Infraestructura**: Detalles técnicos

## ✅ Validaciones

### Tres Niveles de Validación

**1. DTOs (class-validator)**
- Validación automática en endpoints
- Mensajes de error descriptivos
- Transformación automática de tipos

**2. Entidad de Dominio**
- Reglas de negocio (`isAvailable()`, `getTotalValue()`)
- Validaciones de consistencia
- Lógica pura sin dependencias

**3. Base de Datos (MongoDB)**
- Restricciones únicas (email, nombre producto)
- Índices para optimización
- Validaciones de esquema

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Ventaja de la Arquitectura**: Los casos de uso se testean con mocks sin necesidad de BD ni servidor HTTP.

```typescript
// Ejemplo: Test de LoginUseCase
const mockUserRepo = { findByEmail: jest.fn() };
const mockPasswordService = { compare: jest.fn() };
const mockTokenService = { generateToken: jest.fn() };

const useCase = new LoginUseCase(
  mockUserRepo,
  mockPasswordService,
  mockTokenService
);
```

## 🔧 Troubleshooting

### MongoDB no conecta

**Síntoma**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Soluciones:**
```bash
# 1. Verificar que MongoDB está corriendo
docker ps | grep mongodb

# 2. Ver logs del contenedor
docker logs mongodb

# 3. Reiniciar contenedor
docker restart mongodb

# 4. Si no existe, crear nuevo contenedor
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### JWT Secret en Producción

**Síntoma**: Warnings de seguridad

**Solución**: Cambiar `JWT_SECRET` en `.env` a un valor aleatorio seguro:
```bash
# Generar secret seguro (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Productos no aparecen

**Soluciones:**
```bash
# 1. Verificar que seed se ejecutó
npx ts-node src/seed.ts

# 2. Verificar base de datos y colección en Compass
# BD: products-management
# Colección: products (no productdocuments)

# 3. Limpiar y re-seed
npx ts-node src/clear-db.ts
npx ts-node src/seed.ts
```

### Puerto ya en uso

**Síntoma**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# O cambiar puerto en .env
PORT=3001
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run start              # Iniciar aplicación
npm run start:dev          # Modo desarrollo (hot-reload)
npm run start:debug        # Modo debug
npm run build              # Compilar TypeScript

# Base de Datos
npx ts-node src/seed-admin.ts   # Crear usuario admin
npx ts-node src/seed.ts         # Poblar productos
npx ts-node src/clear-db.ts     # Limpiar base de datos

# Calidad de Código
npm run format             # Formatear código (Prettier)
npm run lint               # Ejecutar linter (ESLint)

# Testing
npm test                   # Unit tests
npm run test:watch         # Tests en modo watch
npm run test:e2e           # E2E tests
npm run test:cov           # Cobertura de tests

# Docker
docker ps                  # Ver contenedores activos
docker logs mongodb        # Ver logs de MongoDB
docker restart mongodb     # Reiniciar MongoDB
```

## 📦 Tecnologías

### Core
- **NestJS** ^11.0.1 - Framework Node.js progresivo
- **TypeScript** ^5.7.3 - Lenguaje con tipado estático
- **RxJS** ^7.8.2 - Programación reactiva

### Base de Datos
- **MongoDB** - Base de datos NoSQL orientada a documentos
- **Mongoose** ^8.9.3 - ODM (Object Document Mapper)
- **@nestjs/mongoose** ^10.1.0 - Integración NestJS + Mongoose

### Autenticación y Seguridad
- **@nestjs/jwt** - Módulo JWT para NestJS
- **@nestjs/passport** - Integración Passport.js
- **passport-jwt** - Estrategia JWT para Passport
- **bcrypt** - Hashing de passwords
- **uuid** ^11.0.5 - Generación de IDs únicos

### Validación
- **class-validator** ^0.14.1 - Validación declarativa de DTOs
- **class-transformer** ^0.5.1 - Transformación de objetos

### Configuración
- **dotenv** ^16.4.7 - Variables de entorno
- **joi** ^17.14.0 - Validación de schemas de configuración

### Testing
- **Jest** - Framework de testing
- **Supertest** - Testing HTTP E2E

## 🎓 Conceptos Clave Implementados

### Arquitectura
- ✅ **Arquitectura Hexagonal** - Separación clara de capas
- ✅ **Puertos y Adaptadores** - Interfaces e implementaciones desacopladas
- ✅ **Inversión de Dependencias** - Capas externas dependen de interfaces internas
- ✅ **Casos de Uso** - Lógica de aplicación orquestando el dominio

### Patrones de Diseño
- ✅ **Repository Pattern** - Abstracción de persistencia
- ✅ **Dependency Injection** - Inyección con tokens y símbolos
- ✅ **DTO Pattern** - Transferencia de datos con validaciones
- ✅ **Guard Pattern** - Protección de rutas (JWT, Roles)
- ✅ **Decorator Pattern** - Decoradores personalizados (@Auth, @CurrentUser)

### Seguridad
- ✅ **JWT Authentication** - Tokens firmados con secreto
- ✅ **Role-Based Access Control** - Autorización por roles
- ✅ **Password Hashing** - Bcrypt con salt rounds
- ✅ **Guards Composition** - Composición de guards para protección

### Validación
- ✅ **Validación en 3 niveles** - DTOs, Dominio, Base de Datos
- ✅ **Mensajes descriptivos** - Errores claros para el consumidor
- ✅ **Transformación automática** - ValidationPipe global

## 🔒 Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
# Server
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/products-management

# JWT Configuration
JWT_SECRET=tu-secreto-super-seguro-cambiame-en-produccion
JWT_EXPIRES_IN=1d
```

### Configuración de Producción

```env
# Usar URI con autenticación
MONGODB_URI=mongodb://usuario:password@host:27017/db-name?authSource=admin

# Generar JWT_SECRET seguro
JWT_SECRET=<usar-crypto.randomBytes(32).toString('hex')>

# Reducir tiempo de expiración
JWT_EXPIRES_IN=2h
```

## 🚀 Próximos Pasos Sugeridos

### Mejoras de Autenticación
- [ ] **Refresh Tokens** - Tokens de larga duración para renovar access tokens
- [ ] **Email Verification** - Verificación de email al registrar
- [ ] **Password Recovery** - Recuperación de contraseña por email
- [ ] **Two-Factor Auth (2FA)** - Autenticación de dos factores
- [ ] **OAuth2** - Login con Google, GitHub, Facebook
- [ ] **Token Blacklist** - Invalidar tokens al hacer logout
- [ ] **Rate Limiting** - Limitar intentos de login fallidos

### Mejoras de Productos
- [ ] **Paginación** - `GET /products?page=1&limit=10`
- [ ] **Filtros y Búsqueda** - `?search=laptop&minPrice=100`
- [ ] **Ordenamiento** - `?sortBy=price&order=desc`
- [ ] **Soft Delete** - Marcar como eliminado en lugar de borrar
- [ ] **Categorías** - Agrupar productos por categorías
- [ ] **Imágenes** - Upload y gestión de imágenes de productos
- [ ] **Historial** - Tracking de cambios en productos

### Infraestructura
- [ ] **Caché con Redis** - Cachear consultas frecuentes
- [ ] **Eventos de Dominio** - Event sourcing y CQRS
- [ ] **Logging Estructurado** - Winston o Pino
- [ ] **Monitoreo** - Prometheus + Grafana
- [ ] **Health Checks** - Endpoints de salud `/health`
- [ ] **API Documentation** - Swagger/OpenAPI con `@nestjs/swagger`
- [ ] **Docker Compose** - Orquestar app + MongoDB + Redis
- [ ] **CI/CD** - GitHub Actions o GitLab CI

### Testing
- [ ] **Unit Tests Completos** - Cobertura > 80%
- [ ] **Integration Tests** - Tests de integración con BD
- [ ] **E2E Tests** - Tests end-to-end completos
- [ ] **Performance Tests** - Artillery o k6
- [ ] **Security Tests** - OWASP ZAP o similar

## 📄 Licencia

UNLICENSED - Proyecto de ejemplo educativo

---

**Desarrollado con ❤️ usando NestJS, MongoDB y Arquitectura Hexagonal**
