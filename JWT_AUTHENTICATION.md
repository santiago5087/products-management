# Autenticación JWT con Arquitectura Hexagonal

## 📋 Resumen

Este proyecto implementa autenticación JWT siguiendo los principios de arquitectura hexagonal:
- **Puertos y Adaptadores** para autenticación
- **JWT** para tokens de autenticación
- **bcrypt** para hashear passwords
- **Guards** de NestJS como adaptadores de entrada
- **Roles y permisos** con decoradores personalizados

## 🏗️ Estructura del Módulo Auth

```
src/auth/
├── domain/                           # Núcleo del negocio
│   ├── entities/
│   │   └── user.entity.ts           # Entidad User con validaciones
│   └── ports/
│       ├── inbound/                  # Contratos de casos de uso
│       │   └── auth-use-cases.port.ts
│       └── outbound/                 # Contratos de servicios
│           ├── user.repository.port.ts
│           ├── token.service.port.ts
│           └── password.service.port.ts
│
├── application/                      # Lógica de aplicación
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   ├── auth-response.dto.ts
│   │   └── user.dto.ts
│   └── use-cases/
│       ├── login.use-case.ts
│       ├── register.use-case.ts
│       └── validate-token.use-case.ts
│
└── infrastructure/                   # Implementaciones concretas
    ├── inbound/                      # Adaptadores de entrada
    │   ├── http/
    │   │   └── auth.controller.ts
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts    # Guard JWT
    │   │   └── roles.guard.ts       # Guard de roles
    │   └── decorators/
    │       ├── current-user.decorator.ts
    │       ├── roles.decorator.ts
    │       └── auth.decorator.ts    # Decorador compuesto
    └── outbound/                     # Adaptadores de salida
        ├── persistence/
        │   ├── schemas/
        │   │   └── user.schema.ts
        │   └── mongoose-user.repository.adapter.ts
        ├── bcrypt-password.service.adapter.ts
        └── jwt-token.service.adapter.ts
```

## 🔄 Flujo de Autenticación

### Registro de Usuario

```
POST /auth/register
    ↓
AuthController
    ↓
RegisterUseCase
    ↓
1. Verificar que email no exista (UserRepository)
2. Hashear password (PasswordService)
3. Crear entidad User
4. Guardar en BD (UserRepository)
5. Generar token JWT (TokenService)
    ↓
Respuesta: { access_token, user }
```

### Login

```
POST /auth/login
    ↓
AuthController
    ↓
LoginUseCase
    ↓
1. Buscar usuario por email (UserRepository)
2. Verificar password (PasswordService)
3. Generar token JWT (TokenService)
    ↓
Respuesta: { access_token, user }
```

### Acceso a Endpoint Protegido

```
Request con header: Authorization: Bearer <token>
    ↓
JwtAuthGuard (intercepta request)
    ↓
1. Extraer token del header
2. Validar token (ValidateTokenUseCase)
3. Adjuntar usuario al request
    ↓
RolesGuard (si aplica)
    ↓
1. Verificar roles requeridos
2. Verificar que usuario tenga rol
    ↓
Controller ejecuta endpoint
```

## 🚀 Endpoints de Autenticación

### POST /auth/register
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "roles": ["user"]  // Opcional, default: ["user"]
}
```

**Respuesta (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"]
  }
}
```

### POST /auth/login
Inicia sesión.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"]
  }
}
```

### GET /auth/profile
Obtiene el perfil del usuario autenticado (requiere token).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["user"],
  "isActive": true
}
```

## 🔒 Protección de Endpoints

### Usando el Decorador @Auth()

```typescript
import { Auth } from '../auth/infrastructure/inbound/decorators/auth.decorator';
import { CurrentUser } from '../auth/infrastructure/inbound/decorators/current-user.decorator';

@Controller('products')
export class ProductHttpController {
  
  // Endpoint público (sin protección)
  @Get()
  async findAll() {
    return await this.getAllProductsUseCase.execute();
  }

  // Requiere autenticación (cualquier usuario autenticado)
  @Post()
  @Auth()
  async create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return await this.createProductUseCase.execute(dto);
  }

  // Requiere autenticación Y rol 'admin'
  @Delete(':id')
  @Auth('admin')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.deleteProductUseCase.execute(id);
  }

  // Requiere autenticación Y uno de los roles: 'admin' o 'moderator'
  @Put(':id')
  @Auth('admin', 'moderator')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return await this.updateProductUseCase.execute(id, dto);
  }
}
```

### Usando Guards Directamente

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/infrastructure/inbound/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/infrastructure/inbound/guards/roles.guard';
import { Roles } from '../auth/infrastructure/inbound/decorators/roles.decorator';

@Controller('products')
export class ProductHttpController {
  
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateProductDto) {
    // ...
  }
}
```

## 📦 Estado Actual de Endpoints de Productos

| Endpoint | Método | Protección | Descripción |
|----------|--------|------------|-------------|
| `/products` | GET | ❌ Público | Listar todos los productos |
| `/products/:id` | GET | ❌ Público | Obtener un producto |
| `/products` | POST | ✅ Admin | Crear producto |
| `/products/:id` | PUT | ✅ Admin | Actualizar producto |
| `/products/:id` | DELETE | ✅ Admin | Eliminar producto |

## 🧪 Pruebas con cURL

### 1. Crear usuario administrador

```bash
# Ejecutar script de seed
npx ts-node src/seed-admin.ts
```

Esto crea un usuario:
- **Email**: admin@example.com
- **Password**: admin123
- **Roles**: admin, user

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 3. Obtener perfil (con token)

```bash
TOKEN="tu-token-aqui"

curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Crear producto (requiere token de admin)

```bash
TOKEN="tu-token-aqui"

curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Nuevo Producto",
    "description": "Descripción del producto con al menos 10 caracteres",
    "price": 99.99,
    "stock": 10
  }'
```

### 5. Intentar crear producto sin token (error 401)

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto",
    "description": "Descripción del producto",
    "price": 99.99,
    "stock": 10
  }'
```

**Respuesta:**
```json
{
  "statusCode": 401,
  "message": "Token no proporcionado",
  "error": "Unauthorized"
}
```

### 6. Intentar crear producto con usuario sin rol admin (error 403)

```bash
# 1. Registrar usuario normal
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "user123",
    "name": "Usuario Normal"
  }'

# 2. Obtener token del usuario normal
TOKEN_USER="token-del-usuario-normal"

# 3. Intentar crear producto (fallará)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USER" \
  -d '{
    "name": "Producto",
    "description": "Descripción del producto",
    "price": 99.99,
    "stock": 10
  }'
```

**Respuesta:**
```json
{
  "statusCode": 403,
  "message": "Se requiere uno de los siguientes roles: admin",
  "error": "Forbidden"
}
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/products-management

# JWT Configuration
JWT_SECRET=tu-secreto-super-seguro-cambiame-en-produccion
JWT_EXPIRES_IN=1d
```

**IMPORTANTE**: 
- Cambia `JWT_SECRET` en producción a un valor aleatorio y seguro
- Usa `JWT_EXPIRES_IN` para controlar la duración del token (ej: 1h, 7d, 30d)

## 🎯 Ventajas de la Arquitectura Hexagonal en Auth

### 1. **Guards como Adaptadores de Entrada**

Los guards (`JwtAuthGuard`, `RolesGuard`) son adaptadores que:
- Implementan lógica específica de HTTP/NestJS
- Delegan la validación real a casos de uso
- No contaminan el dominio

### 2. **Puertos para Servicios Externos**

Los servicios (`ITokenService`, `IPasswordService`) son puertos que:
- Abstraen la tecnología específica (JWT, bcrypt)
- Permiten cambiar fácilmente de implementación
- Facilitan el testing con mocks

### 3. **Casos de Uso Reutilizables**

Los casos de uso (`LoginUseCase`, `ValidateTokenUseCase`) pueden usarse desde:
- REST API (actual)
- GraphQL (futuro)
- WebSockets (futuro)
- Colas de mensajes (futuro)

### 4. **Cambio de Tecnología Sin Dolor**

**Ejemplo: Cambiar de JWT a Auth0**

```typescript
// 1. Crear nuevo adaptador
@Injectable()
export class Auth0TokenServiceAdapter implements ITokenService {
  // Implementación con Auth0
}

// 2. Cambiar en auth.module.ts
{
  provide: TOKEN_SERVICE,
  useClass: Auth0TokenServiceAdapter,  // ← Solo esto cambia
}
```

¡Todo el resto del código sigue funcionando!

## 📝 Próximos Pasos

1. **Refresh Tokens**: Implementar tokens de refresco
2. **Email Verification**: Verificación de email al registrar
3. **Password Recovery**: Recuperación de contraseña
4. **Two-Factor Auth**: Autenticación de dos factores
5. **OAuth2**: Login con Google, GitHub, etc.
6. **Rate Limiting**: Limitar intentos de login
7. **Blacklist de Tokens**: Invalidar tokens al logout
8. **Audit Log**: Registrar accesos y cambios

## 🔧 Scripts Disponibles

```bash
# Crear usuario administrador
npx ts-node src/seed-admin.ts

# Poblar productos
npx ts-node src/seed.ts

# Iniciar aplicación
npm run start:dev

# Compilar
npm run build
```

## 🧪 Testing

### Test de Login (Ejemplo)

```typescript
describe('LoginUseCase', () => {
  it('should return token when credentials are valid', async () => {
    // Arrange
    const mockUserRepo = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
    };
    const mockPasswordService = {
      compare: jest.fn().mockResolvedValue(true),
    };
    const mockTokenService = {
      generateToken: jest.fn().mockReturnValue('fake-token'),
    };

    const useCase = new LoginUseCase(
      mockUserRepo,
      mockPasswordService,
      mockTokenService,
    );

    // Act
    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    // Assert
    expect(result.access_token).toBe('fake-token');
    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
```

---

**Desarrollado con ❤️ usando NestJS, JWT y Arquitectura Hexagonal**
