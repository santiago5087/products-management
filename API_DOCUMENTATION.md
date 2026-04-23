# Products Management API - Documentación de Endpoints

## 📚 Información General

- **Base URL**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`
- **Versión**: 1.0
- **Arquitectura**: Hexagonal (Ports & Adapters)
- **Autenticación**: JWT Bearer Token

---

## 🔐 Autenticación (Auth)

### 1. Registrar Usuario

**POST** `/auth/register`

Crea una nueva cuenta de usuario con email, contraseña, nombre y roles opcionales.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "roles": ["user"]
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"]
  }
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos o email ya registrado
- `500 Internal Server Error`: Error del servidor

---

### 2. Iniciar Sesión

**POST** `/auth/login`

Autentica un usuario con email y contraseña. Devuelve un token JWT válido por 1 día.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "name": "Admin User",
    "roles": ["admin"]
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas

---

### 3. Obtener Perfil

**GET** `/auth/profile`

🔒 **Requiere autenticación**

Devuelve la información del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "name": "Admin User",
  "roles": ["admin"],
  "isActive": true
}
```

**Errores:**
- `401 Unauthorized`: No autenticado o token inválido

---

## 📦 Productos (Products)

### 1. Listar Productos (con/sin paginación)

**GET** `/products`

Obtiene todos los productos. Si se proporcionan query params `page` o `limit`, devuelve resultado paginado.

**Query Parameters:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `page` | number | No | 1 | Número de página (inicia en 1) |
| `limit` | number | No | 10 | Elementos por página (máx. 100) |
| `sortBy` | string | No | createdAt | Campo para ordenar |
| `order` | enum | No | desc | Orden: `asc` o `desc` |

**Ejemplos:**

- **Sin paginación (legacy)**: `GET /products`
- **Con paginación**: `GET /products?page=1&limit=10`
- **Ordenado**: `GET /products?page=1&limit=10&sortBy=name&order=asc`

**Response (200 OK) - Sin paginación:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Laptop Dell XPS 15",
    "description": "Laptop potente con procesador Intel i7",
    "price": 1299.99,
    "stock": 50,
    "available": true,
    "totalValue": 64999.50,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
]
```

**Response (200 OK) - Con paginación:**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Laptop Dell XPS 15",
      "description": "Laptop potente con procesador Intel i7",
      "price": 1299.99,
      "stock": 50,
      "available": true,
      "totalValue": 64999.50,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T14:20:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### 2. Obtener Producto por ID

**GET** `/products/:id`

Busca y devuelve un producto específico por su identificador único.

**Parámetros de URL:**
- `id` (string): ID del producto (formato MongoDB ObjectId)

**Ejemplo:** `GET /products/507f1f77bcf86cd799439011`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Laptop Dell XPS 15",
  "description": "Laptop potente con procesador Intel i7",
  "price": 1299.99,
  "stock": 50,
  "available": true,
  "totalValue": 64999.50,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T14:20:00.000Z"
}
```

**Errores:**
- `404 Not Found`: Producto no encontrado

---

### 3. Crear Producto

**POST** `/products`

🔒 **Requiere autenticación y rol `admin`**

Crea un producto nuevo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "description": "Laptop potente con procesador Intel i7, 16GB RAM y pantalla 4K",
  "price": 1299.99,
  "stock": 50
}
```

**Validaciones:**
- `name`: 3-100 caracteres, obligatorio
- `description`: 10-500 caracteres, obligatorio
- `price`: número >= 0, obligatorio
- `stock`: número >= 0, obligatorio

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Laptop Dell XPS 15",
  "description": "Laptop potente con procesador Intel i7, 16GB RAM y pantalla 4K",
  "price": 1299.99,
  "stock": 50,
  "available": true,
  "totalValue": 64999.50,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos (rol admin requerido)

---

### 4. Actualizar Producto

**PUT** `/products/:id`

🔒 **Requiere autenticación y rol `admin`**

Actualiza un producto existente por su ID. Todos los campos son opcionales.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros de URL:**
- `id` (string): ID del producto a actualizar

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15 (Actualizado)",
  "price": 1199.99,
  "stock": 75
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Laptop Dell XPS 15 (Actualizado)",
  "description": "Laptop potente con procesador Intel i7, 16GB RAM y pantalla 4K",
  "price": 1199.99,
  "stock": 75,
  "available": true,
  "totalValue": 89999.25,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T15:45:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos (rol admin requerido)
- `404 Not Found`: Producto no encontrado

---

### 5. Eliminar Producto

**DELETE** `/products/:id`

🔒 **Requiere autenticación y rol `admin`**

Elimina un producto por su ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros de URL:**
- `id` (string): ID del producto a eliminar

**Ejemplo:** `DELETE /products/507f1f77bcf86cd799439011`

**Response (204 No Content):**
Sin contenido en el cuerpo de la respuesta.

**Errores:**
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos (rol admin requerido)
- `404 Not Found`: Producto no encontrado

---

## 🔑 Autenticación JWT

### Cómo usar el token JWT

1. **Obtener el token**: Realiza login en `/auth/login` o registra un usuario en `/auth/register`
2. **Usar el token**: Agrega el header en cada petición protegida:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Validez**: El token es válido por 1 día (24 horas)
4. **Roles**: Los endpoints de productos POST/PUT/DELETE requieren rol `admin`

### Ejemplo con cURL

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# 2. Crear producto (usando el token)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Nuevo Producto",
    "description": "Descripción del producto",
    "price": 99.99,
    "stock": 10
  }'
```

---

## 📊 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200 OK` | Petición exitosa |
| `201 Created` | Recurso creado exitosamente |
| `204 No Content` | Eliminación exitosa (sin contenido) |
| `400 Bad Request` | Datos inválidos o validación fallida |
| `401 Unauthorized` | No autenticado o token inválido |
| `403 Forbidden` | Autenticado pero sin permisos suficientes |
| `404 Not Found` | Recurso no encontrado |
| `500 Internal Server Error` | Error del servidor |

---

## 🚀 Probar la API

### Opción 1: Swagger UI (Recomendado)
Accede a `http://localhost:3000/api` en tu navegador para una interfaz interactiva.

### Opción 2: Thunder Client / Postman
Importa los endpoints manualmente o usa esta documentación como referencia.

### Opción 3: cURL
Usa los ejemplos de cURL proporcionados en cada sección.

---

## 📝 Notas Importantes

1. **Paginación**: 
   - Por defecto: página 1, límite 10 elementos
   - Límite máximo: 100 elementos por página
   - Orden por defecto: descendente por `createdAt`

2. **Validaciones**:
   - Todos los DTOs tienen validaciones automáticas con `class-validator`
   - Los errores de validación devuelven detalles específicos del campo

3. **CORS**:
   - Habilitado para `localhost` en cualquier puerto durante desarrollo
   - Permite credenciales (cookies, headers de autorización)

4. **Base de datos**:
   - MongoDB con Mongoose
   - IDs en formato ObjectId de MongoDB

5. **Campos calculados**:
   - `available`: Se calcula automáticamente (stock > 0)
   - `totalValue`: Se calcula automáticamente (price * stock)
