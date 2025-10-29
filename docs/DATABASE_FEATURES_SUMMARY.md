# Database Features Summary

## Implemented Features

Đã thêm enterprise-grade features vào DatabaseModule, lấy cảm hứng từ **ack-nestjs-boilerplate**:

### ✅ 1. Soft Delete
- `SoftDeletableEntity` với `deletedAt` và `deletedBy`
- `SoftDeletableRepository` với methods:
  - `softDelete()`, `softDeleteMany()`
  - `restore()`, `restoreMany()`
  - `forceDelete()`, `forceDeleteMany()`
  - `findAllWithDeleted()`, `findAllOnlyDeleted()`
  - `countWithDeleted()`, `countOnlyDeleted()`

### ✅ 2. Audit Trail
- `AuditableEntity` extends `SoftDeletableEntity`
- Thêm fields: `createdBy`, `updatedBy`, `deletedBy`
- `AuditableRepository` với methods:
  - `createWithAudit(data, createdBy)`
  - `findByIdAndUpdateWithAudit(id, update, updatedBy)`
  - `updateManyWithAudit(filter, update, updatedBy)`

### ✅ 3. Pagination
- `PaginationOptions` interface
- `PaginatedResult<T>` với metadata
- Methods:
  - `findAllPaginated(filter, options)`
  - `findAllPaginatedWithDeleted()`
  - `findAllPaginatedOnlyDeleted()`

## Quick Usage

### Basic CRUD (No audit)
```typescript
export class Product extends Document {}
export class ProductRepository extends BaseRepository<Product> {}
export class ProductService extends BaseService<Product> {}
```

### With Soft Delete
```typescript
export class Product extends SoftDeletableEntity {}
export class ProductRepository extends SoftDeletableRepository<Product> {}
export class ProductService extends SoftDeletableService<Product> {}

// Usage
await productService.softDelete(id);
await productService.restore(id);
await productService.findAllPaginated(filter, { page: 1, limit: 10 });
```

### With Full Audit
```typescript
export class User extends AuditableEntity {}
export class UserRepository extends AuditableRepository<User> {}
export class UserService extends AuditableService<User> {}

// Usage
await userService.createWithAudit(data, 'admin-id');
await userService.findByIdAndUpdateWithAudit(id, update, 'admin-id');
await userService.softDelete(id, 'admin-id');
await userService.findAllPaginated(filter, { page: 1, limit: 10 });
```

## Feature Comparison

| Feature | BaseRepository | SoftDeletableRepository | AuditableRepository |
|---------|---------------|------------------------|-------------------|
| CRUD | ✅ | ✅ | ✅ |
| Soft Delete | ❌ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ |
| Audit Fields | ❌ | ⚠️ (deletedBy only) | ✅ (full) |
| Restore | ❌ | ✅ | ✅ |

## File Structure

```
src/core/database/
├── database.module.ts
├── index.ts
├── decorators/
│   ├── inject-model.decorator.ts
│   └── schema.decorator.ts
├── entities/
│   ├── soft-deletable.entity.ts
│   └── auditable.entity.ts
├── interfaces/
│   ├── repository.interface.ts
│   └── pagination.interface.ts
├── repositories/
│   ├── base.repository.ts
│   ├── soft-deletable.repository.ts
│   └── auditable.repository.ts
└── services/
    ├── base.service.ts
    ├── soft-deletable.service.ts
    └── auditable.service.ts
```

## Example: User Module

### Entity
```typescript
import { Prop, Schema, SchemaFactory, AuditableEntity } from '@/core/database';

@Schema({ timestamps: true })
export class User extends AuditableEntity {
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) name: string;
  // createdBy, updatedBy, deletedBy, deletedAt inherited
}
```

### Repository
```typescript
import { AuditableRepository, InjectModel } from '@/core/database';
import type { Model } from '@/core/database';

@Injectable()
export class UserRepository extends AuditableRepository<User> {
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }
}
```

### Service
```typescript
import { AuditableService, PaginatedResult, PaginationOptions } from '@/core/database';

@Injectable()
export class UserService extends AuditableService<User> {
  async createUser(data: any, createdBy: string): Promise<User> {
    return this.createWithAudit(data, createdBy);
  }

  async getUsersPaginated(options: PaginationOptions): Promise<PaginatedResult<User>> {
    return this.findAllPaginated({ isActive: true }, options);
  }

  async softDeleteUser(userId: string, deletedBy: string): Promise<User | null> {
    return this.softDelete(userId, deletedBy);
  }
}
```

## Key Differences from ack-boilerplate

| Feature | ack-boilerplate | Our Implementation |
|---------|----------------|-------------------|
| Complexity | High (500+ lines) | Medium (150-200 lines per class) |
| Learning Curve | Steep | Moderate |
| Aggregation | ✅ Built-in | ❌ Use raw mongoose |
| Locking | ✅ Pessimistic lock | ❌ Not implemented |
| Upsert | ✅ Built-in | ❌ Use findOneAndUpdate |
| Options Pattern | ✅ Complex | ✅ Simple |

## When to Use What?

**BaseRepository**:
- Temporary data
- Logs
- Simple reference data

**SoftDeletableRepository**:
- User content
- Transactional data
- Recoverable data

**AuditableRepository**:
- Financial records
- User accounts
- Compliance-required data

## Documentation

- 📖 [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - Basic patterns
- 📖 [ADVANCED_DATABASE_FEATURES.md](./ADVANCED_DATABASE_FEATURES.md) - Advanced features guide

## Migration Path

Upgrading from BaseRepository to AuditableRepository:

```typescript
// 1. Change entity
- export class User extends Document {}
+ export class User extends AuditableEntity {}

// 2. Change repository
- export class UserRepository extends BaseRepository<User> {}
+ export class UserRepository extends AuditableRepository<User> {}

// 3. Change service
- export class UserService extends BaseService<User> {}
+ export class UserService extends AuditableService<User> {}

// 4. Update method calls
- await service.create(data);
+ await service.createWithAudit(data, currentUserId);

- await service.findByIdAndUpdate(id, update);
+ await service.findByIdAndUpdateWithAudit(id, update, currentUserId);
```

## Best Practices

1. **Always use audit methods** when extending AuditableService
2. **Validate pagination params** (page >= 1, limit between 1-100)
3. **Cleanup old soft-deleted records** periodically
4. **Get userId from request context** for audit trail
5. **Use soft delete** for user-generated content
6. **Use force delete** only for cleanup/maintenance

Build đã pass, all features working! 🚀
