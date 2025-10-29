# Advanced Database Features

## Overview

DatabaseModule cung cấp các advanced features được lấy cảm hứng từ enterprise patterns:

- **Soft Delete**: Đánh dấu xóa thay vì xóa vĩnh viễn
- **Audit Trail**: Track who và when created/updated/deleted
- **Pagination**: Built-in pagination với metadata
- **Flexible Queries**: Include/exclude soft-deleted records

## Entity Hierarchy

```
Document (Mongoose)
    ↓
SoftDeletableEntity
    ├── deletedAt?: Date
    └── deletedBy?: string
        ↓
AuditableEntity
    ├── createdBy?: string
    ├── updatedBy?: string
    ├── createdAt: Date
    └── updatedAt: Date
```

## Repository Hierarchy

```
BaseRepository<T>
    ↓
SoftDeletableRepository<T>
    ↓
AuditableRepository<T>
```

## Service Hierarchy

```
BaseService<T>
    ↓
SoftDeletableService<T>
    ↓
AuditableService<T>
```

---

## 1. Soft Delete Feature

### Why Soft Delete?

- **Data Recovery**: Khôi phục data khi xóa nhầm
- **Audit Compliance**: Giữ lại history cho audit
- **Referential Integrity**: Không làm hỏng foreign keys
- **Business Logic**: Một số business rules cần giữ deleted records

### Using SoftDeletableEntity

```typescript
import { Prop, Schema, SchemaFactory, SoftDeletableEntity } from '@/core/database';

@Schema({ timestamps: true })
export class Product extends SoftDeletableEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  // deletedAt và deletedBy inherited từ SoftDeletableEntity
}

export const ProductSchema = SchemaFactory.createForClass(Product);
```

### Using SoftDeletableRepository

```typescript
import { Injectable } from '@nestjs/common';
import { SoftDeletableRepository, InjectModel } from '@/core/database';
import type { Model } from '@/core/database';

import { Product } from '../schemas/product.schema';

@Injectable()
export class ProductRepository extends SoftDeletableRepository<Product> {
  constructor(@InjectModel(Product.name) model: Model<Product>) {
    super(model);
  }

  // Custom methods
  async findByCategory(category: string): Promise<Product[]> {
    return this.findAll({ category });
  }
}
```

### Soft Delete Methods

```typescript
// Soft delete (set deletedAt)
await productRepository.softDelete(productId, 'admin-user-id');

// Soft delete many
await productRepository.softDeleteMany({ category: 'old' }, 'admin-user-id');

// Restore soft deleted
await productRepository.restore(productId);

// Restore many
await productRepository.restoreMany({ category: 'important' });

// Force delete (permanent)
await productRepository.forceDelete(productId);

// Force delete many (permanent)
await productRepository.forceDeleteMany({ category: 'spam' });
```

### Query Methods with Soft Delete

```typescript
// Default: Only non-deleted records
const products = await productRepository.findAll();
const product = await productRepository.findById(id);
const count = await productRepository.count();

// Include deleted records
const allProducts = await productRepository.findAllWithDeleted();
const countAll = await productRepository.countWithDeleted();

// Only deleted records
const deletedProducts = await productRepository.findAllOnlyDeleted();
const deletedCount = await productRepository.countOnlyDeleted();

// Check existence
const exists = await productRepository.exists({ name: 'iPhone' }); // only non-deleted
const existsIncludingDeleted = await productRepository.existsWithDeleted({ name: 'iPhone' });
```

---

## 2. Audit Trail Feature

### Using AuditableEntity

```typescript
import { Prop, Schema, SchemaFactory, AuditableEntity } from '@/core/database';

@Schema({ timestamps: true })
export class User extends AuditableEntity {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  // Inherited fields:
  // - createdBy?: string
  // - updatedBy?: string
  // - deletedBy?: string
  // - deletedAt?: Date
  // - createdAt: Date
  // - updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Using AuditableRepository

```typescript
import { Injectable } from '@nestjs/common';
import { AuditableRepository, InjectModel } from '@/core/database';
import type { Model } from '@/core/database';

import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository extends AuditableRepository<User> {
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }
}
```

### Audit Methods

```typescript
// Create with audit
const user = await userRepository.create(
  { email: 'test@example.com', name: 'Test User' },
  'admin-user-id' // createdBy
);

// Create many with audit
const users = await userRepository.createMany(
  [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ],
  'admin-user-id' // createdBy for all
);

// Update with audit
await userRepository.findByIdAndUpdate(
  userId,
  { name: 'New Name' },
  'admin-user-id' // updatedBy
);

// Update many with audit
await userRepository.updateMany(
  { role: 'user' },
  { isActive: true },
  'admin-user-id' // updatedBy for all
);

// Soft delete with audit
await userRepository.softDelete(userId, 'admin-user-id'); // deletedBy

// Soft delete many with audit
await userRepository.softDeleteMany(
  { lastLoginAt: { $lt: oldDate } },
  'system' // deletedBy
);
```

### Using AuditableService

```typescript
import { Injectable } from '@nestjs/common';
import { AuditableService } from '@/core/database';

import { User } from '../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService extends AuditableService<User> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  async createUser(data: CreateUserDto, createdBy: string): Promise<User> {
    // Audit tracking automatic
    return this.create(data, createdBy);
  }

  async updateUser(userId: string, data: UpdateUserDto, updatedBy: string): Promise<User | null> {
    return this.findByIdAndUpdate(userId, data, updatedBy);
  }

  async deleteUser(userId: string, deletedBy: string): Promise<User | null> {
    return this.softDelete(userId, deletedBy);
  }
}
```

---

## 3. Pagination Feature

### PaginationOptions Interface

```typescript
interface PaginationOptions {
  page: number;        // Current page (1-indexed)
  limit: number;       // Items per page
  sort?: Record<string, 1 | -1>;  // Sort options
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;        // Total items
    page: number;         // Current page
    limit: number;        // Items per page
    totalPages: number;   // Total pages
    hasNextPage: boolean; // Has next page
    hasPrevPage: boolean; // Has previous page
  };
}
```

### Using Pagination

```typescript
// Basic pagination
const result = await userRepository.findAllPaginated(
  { isActive: true },
  { page: 1, limit: 10 }
);

console.log(result.data);           // Array of users
console.log(result.meta.total);     // Total users count
console.log(result.meta.totalPages);// Total pages
console.log(result.meta.hasNextPage); // true/false

// With sorting
const result = await userRepository.findAllPaginated(
  { isActive: true },
  {
    page: 2,
    limit: 20,
    sort: { createdAt: -1, name: 1 }  // Sort by createdAt DESC, then name ASC
  }
);

// With projection
const result = await userRepository.findAllPaginated(
  { role: 'admin' },
  { page: 1, limit: 10 },
  { password: 0 }  // Exclude password
);
```

### Pagination with Soft Delete

```typescript
// Only non-deleted (default)
const active = await userRepository.findAllPaginated(
  { isActive: true },
  { page: 1, limit: 10 }
);

// Include deleted
const all = await userRepository.findAllPaginatedWithDeleted(
  {},
  { page: 1, limit: 10 }
);

// Only deleted
const deleted = await userRepository.findAllPaginatedOnlyDeleted(
  {},
  { page: 1, limit: 10 }
);
```

### Service Level Pagination

```typescript
@Injectable()
export class UserService extends AuditableService<User> {
  async getUsersPaginated(options: PaginationOptions): Promise<PaginatedResult<User>> {
    return this.findAllPaginated({ isActive: true }, options);
  }

  async searchUsers(
    searchTerm: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<User>> {
    return this.findAllPaginated(
      {
        $or: [
          { email: { $regex: searchTerm, $options: 'i' } },
          { name: { $regex: searchTerm, $options: 'i' } },
        ],
      },
      options
    );
  }
}
```

---

## 4. Complete Example: User Module

### Schema

```typescript
// src/modules/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory, AuditableEntity } from '@/core/database';

@Schema({ timestamps: true, collection: 'users' })
export class User extends AuditableEntity {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Repository

```typescript
// src/modules/users/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { AuditableRepository, InjectModel } from '@/core/database';
import type { Model } from '@/core/database';

import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository extends AuditableRepository<User> {
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findAll({ isActive: true });
  }
}
```

### Service

```typescript
// src/modules/users/services/user.service.ts
import { Injectable } from '@nestjs/common';
import { AuditableService, PaginatedResult, PaginationOptions } from '@/core/database';

import { User } from '../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService extends AuditableService<User> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  async createUser(
    email: string,
    name: string,
    password: string,
    createdBy: string
  ): Promise<User> {
    return this.create({ email, name, password }, createdBy);
  }

  async updateUser(
    userId: string,
    data: Partial<User>,
    updatedBy: string
  ): Promise<User | null> {
    return this.findByIdAndUpdate(userId, data, updatedBy);
  }

  async softDeleteUser(userId: string, deletedBy: string): Promise<User | null> {
    return this.softDelete(userId, deletedBy);
  }

  async restoreUser(userId: string): Promise<User | null> {
    return this.restore(userId);
  }

  async getUsersPaginated(options: PaginationOptions): Promise<PaginatedResult<User>> {
    return this.findAllPaginated({ isActive: true }, options);
  }

  async getDeletedUsers(): Promise<User[]> {
    return this.findAllOnlyDeleted();
  }

  async getUserStats() {
    const [total, active, deleted] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.countOnlyDeleted(),
    ]);

    return { total, active, deleted };
  }
}
```

### Controller Example

```typescript
// src/modules/users/controllers/user.controller.ts
import { Controller, Get, Post, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() body: any, @CurrentUser() currentUser: any) {
    return this.userService.createUser(
      body.email,
      body.name,
      body.password,
      currentUser.id // createdBy
    );
  }

  @Get()
  async getUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.userService.getUsersPaginated({ page: +page, limit: +limit });
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() currentUser: any
  ) {
    return this.userService.updateUser(id, body, currentUser.id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.userService.softDeleteUser(id, currentUser.id);
  }

  @Patch(':id/restore')
  async restoreUser(@Param('id') id: string) {
    return this.userService.restoreUser(id);
  }

  @Get('deleted')
  async getDeletedUsers() {
    return this.userService.getDeletedUsers();
  }

  @Get('stats')
  async getUserStats() {
    return this.userService.getUserStats();
  }
}
```

---

## 5. Best Practices

### When to Use Each Pattern

**BaseRepository/BaseService**:
- ✅ Simple CRUD without soft delete
- ✅ Temporary data, logs
- ✅ Reference data không cần audit

**SoftDeletableRepository/Service**:
- ✅ User-generated content
- ✅ Transactional data
- ✅ Data có thể recover

**AuditableRepository/Service**:
- ✅ Financial records
- ✅ User accounts
- ✅ Critical business data
- ✅ Compliance requirements

### Audit Field Recommendations

```typescript
// Get current user from request context
import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class AuditContext {
  constructor(@Inject(REQUEST) private request: any) {}

  getCurrentUserId(): string {
    return this.request.user?.id || 'system';
  }
}

// Use in service
@Injectable()
export class UserService extends AuditableService<User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditContext: AuditContext,
  ) {
    super(userRepository);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const currentUserId = this.auditContext.getCurrentUserId();
    return this.create(data, currentUserId);
  }
}
```

### Pagination Guidelines

```typescript
// Reasonable limits
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

function validatePaginationOptions(options: PaginationOptions): PaginationOptions {
  return {
    page: Math.max(1, options.page),
    limit: Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, options.limit)),
    sort: options.sort,
  };
}
```

### Soft Delete Cleanup

```typescript
// Periodic cleanup of old soft-deleted records
@Injectable()
export class CleanupService {
  constructor(private readonly userRepository: UserRepository) {}

  @Cron('0 0 * * 0') // Weekly
  async cleanupOldDeletedUsers() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const count = await this.userRepository.forceDeleteMany({
      deletedAt: { $lt: thirtyDaysAgo },
    });

    console.log(`Cleaned up ${count} old deleted users`);
  }
}
```

---

## 6. Migration Guide

### From BaseRepository to AuditableRepository

```typescript
// Before
export class User extends Document {
  @Prop() email: string;
  @Prop() name: string;
}

export class UserRepository extends BaseRepository<User> {}
export class UserService extends BaseService<User> {}

// After
export class User extends AuditableEntity {
  @Prop() email: string;
  @Prop() name: string;
  // createdBy, updatedBy, deletedBy, deletedAt inherited
}

export class UserRepository extends AuditableRepository<User> {}
export class UserService extends AuditableService<User> {}

// Update method calls to include audit parameters
await userService.create(data, currentUserId);
await userService.findByIdAndUpdate(id, data, currentUserId);
await userService.softDelete(id, currentUserId);
```

## Summary

DatabaseModule cung cấp 3 levels của functionality:

1. **Basic**: BaseRepository/BaseService - CRUD đơn giản
2. **Soft Delete**: SoftDeletableRepository/Service - Thêm soft delete + pagination
3. **Auditable**: AuditableRepository/Service - Full audit trail + soft delete + pagination

Chọn level phù hợp với requirements của từng entity!
