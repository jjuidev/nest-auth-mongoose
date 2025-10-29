# Database & Repository Pattern Guide

## Overview

Project sử dụng **MongoDB** với **Mongoose** thông qua **@nestjs/mongoose**, áp dụng **Repository Pattern** và **Generic Service Pattern** để đảm bảo:

- **Separation of Concerns**: Tách biệt business logic và data access
- **Testability**: Dễ dàng mock repositories khi test
- **Reusability**: Tái sử dụng generic CRUD operations
- **Maintainability**: Code clean, dễ maintain và scale

## Architecture Pattern

```
┌─────────────────────────────────────────────────┐
│                 Controller                      │
│          (HTTP Request/Response)                │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              Service Layer                      │
│     (Business Logic, Validation)                │
│     extends BaseService<T>                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│            Repository Layer                     │
│      (Data Access, Queries)                     │
│      extends BaseRepository<T>                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│            Mongoose Model                       │
│         (MongoDB Schema)                        │
└─────────────────────────────────────────────────┘
```

## Setup & Configuration

### 1. Environment Variables

Thêm MongoDB URI vào `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/nest-auth-mongoose
```

### 2. Database Module

DatabaseModule đã được cấu hình tự động trong CoreModule (global). Không cần import thêm vào feature modules.

## Creating a New Entity

### Step 1: Define Schema

Tạo schema trong `src/modules/{module-name}/schemas/{entity}.schema.ts`:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,           // Tự động tạo createdAt, updatedAt
  collection: 'users',        // Tên collection trong MongoDB
  versionKey: false,          // Tắt __v field
})
export class User extends Document {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({ required: true, select: false })  // select: false = không query mặc định
  password: string;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  // TypeScript types cho timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
```

**Schema Options:**

- `timestamps: true` - Auto thêm `createdAt` và `updatedAt`
- `collection` - Tên collection (mặc định là lowercase + plural)
- `versionKey: false` - Tắt `__v` version field

**@Prop Options:**

- `required` - Field bắt buộc
- `unique` - Giá trị unique
- `default` - Giá trị mặc định
- `select: false` - Không query mặc định (dùng cho password)
- `trim` - Remove whitespace
- `lowercase/uppercase` - Transform case
- `minlength/maxlength` - String validation
- `min/max` - Number validation
- `enum` - Giới hạn values
- `type` - Explicit type definition

### Step 2: Create Repository

Tạo repository trong `src/modules/{module-name}/repositories/{entity}.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@/core/database';

import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }

  // Custom methods specific to User entity
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.model.findOne({ email: email.toLowerCase() })
      .select('+password')  // Include password field
      .exec();
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findAll({ isActive: true }, null, { sort: { createdAt: -1 } });
  }

  async updateLastLogin(userId: string): Promise<User | null> {
    return this.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }
}
```

**BaseRepository Methods (đã có sẵn):**

```typescript
create(data)              // Tạo mới 1 document
createMany(data[])        // Tạo nhiều documents

findById(id)              // Tìm theo ID
findOne(filter)           // Tìm 1 document
findAll(filter)           // Tìm tất cả

findByIdAndUpdate(id, update)       // Update theo ID
findOneAndUpdate(filter, update)    // Update theo filter
updateMany(filter, update)          // Update nhiều documents

findByIdAndDelete(id)               // Xóa theo ID
findOneAndDelete(filter)            // Xóa theo filter
deleteMany(filter)                  // Xóa nhiều documents

count(filter)             // Đếm documents
exists(filter)            // Check tồn tại
```

### Step 3: Create Service

Tạo service trong `src/modules/{module-name}/services/{entity}.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';

import { BaseService } from '@/core/database';
import { InjectLogger, LoggerService } from '@/core/logger';

import { User } from '../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService extends BaseService<User> {
  @InjectLogger()
  private readonly logger: LoggerService;

  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  // Business logic methods
  async createUser(email: string, name: string, password: string): Promise<User> {
    this.logger.log(`Creating user: ${email}`);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`User already exists: ${email}`);
      throw new Error('User already exists');
    }

    const user = await this.userRepository.create({
      email,
      name,
      password,
    });

    this.logger.log(`User created successfully: ${user.id}`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getUserStats(): Promise<{ total: number; active: number }> {
    const [total, active] = await Promise.all([
      this.count(),
      this.userRepository.countActiveUsers(),
    ]);

    return { total, active };
  }
}
```

**BaseService Methods (inherited):**

Service kế thừa tất cả methods từ BaseRepository thông qua BaseService. Thêm business logic methods tùy chỉnh.

### Step 4: Create Module

Tạo module trong `src/modules/{module-name}/{module-name}.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
  ],
  providers: [UserRepository, UserService],
  exports: [UserService],  // Export service để modules khác có thể dùng
})
export class UsersModule {}
```

## Query Examples

### Basic Queries

```typescript
// Find all
const users = await this.userRepository.findAll();

// Find with filter
const activeUsers = await this.userRepository.findAll({ isActive: true });

// Find one
const user = await this.userRepository.findOne({ email: 'test@example.com' });

// Find by ID
const user = await this.userRepository.findById('507f1f77bcf86cd799439011');

// Count
const total = await this.userRepository.count({ role: 'admin' });

// Exists
const exists = await this.userRepository.exists({ email: 'test@example.com' });
```

### Advanced Queries

```typescript
// With projection (select specific fields)
const users = await this.userRepository.findAll(
  { isActive: true },
  { name: 1, email: 1 },  // Only return name and email
);

// With options (sort, limit, skip)
const users = await this.userRepository.findAll(
  { role: 'user' },
  null,
  {
    sort: { createdAt: -1 },  // Sort by createdAt descending
    limit: 10,                 // Limit to 10 results
    skip: 0,                   // Skip 0 (for pagination)
  }
);

// With populate (for relations)
const users = await this.model
  .find({ isActive: true })
  .populate('posts')          // Populate referenced documents
  .exec();
```

### Update Operations

```typescript
// Update one by ID
const user = await this.userRepository.findByIdAndUpdate(
  userId,
  { name: 'New Name' }
);

// Update one by filter
const user = await this.userRepository.findOneAndUpdate(
  { email: 'test@example.com' },
  { $set: { isActive: false } }
);

// Update many
const count = await this.userRepository.updateMany(
  { role: 'user' },
  { $set: { isActive: true } }
);

// Increment field
const user = await this.userRepository.findByIdAndUpdate(
  userId,
  { $inc: { loginCount: 1 } }
);
```

### Delete Operations

```typescript
// Delete by ID
const user = await this.userRepository.findByIdAndDelete(userId);

// Delete by filter
const user = await this.userRepository.findOneAndDelete({ email: 'test@example.com' });

// Delete many
const count = await this.userRepository.deleteMany({ isActive: false });
```

## MongoDB Operators

### Comparison Operators

```typescript
// Equal
{ age: 25 }
{ age: { $eq: 25 } }

// Not equal
{ age: { $ne: 25 } }

// Greater than / Less than
{ age: { $gt: 18 } }       // > 18
{ age: { $gte: 18 } }      // >= 18
{ age: { $lt: 65 } }       // < 65
{ age: { $lte: 65 } }      // <= 65

// In array
{ role: { $in: ['user', 'admin'] } }

// Not in array
{ status: { $nin: ['banned', 'deleted'] } }
```

### Logical Operators

```typescript
// AND (implicit)
{ isActive: true, role: 'user' }

// AND (explicit)
{ $and: [{ isActive: true }, { role: 'user' }] }

// OR
{ $or: [{ role: 'admin' }, { role: 'moderator' }] }

// NOT
{ age: { $not: { $gte: 18 } } }

// NOR
{ $nor: [{ isActive: false }, { isDeleted: true }] }
```

### Element Operators

```typescript
// Exists
{ phone: { $exists: true } }

// Type check
{ age: { $type: 'number' } }
```

### Array Operators

```typescript
// All elements match
{ tags: { $all: ['nodejs', 'typescript'] } }

// Array size
{ tags: { $size: 3 } }

// Element match (for array of objects)
{
  items: {
    $elemMatch: { quantity: { $gt: 10 }, price: { $lt: 100 } }
  }
}
```

### Update Operators

```typescript
// Set field
{ $set: { name: 'New Name' } }

// Unset (remove field)
{ $unset: { temporaryField: '' } }

// Increment
{ $inc: { age: 1, loginCount: 1 } }

// Multiply
{ $mul: { price: 1.1 } }

// Rename field
{ $rename: { oldName: 'newName' } }

// Set if field doesn't exist
{ $setOnInsert: { createdAt: new Date() } }

// Min/Max
{ $min: { lowestScore: 50 } }
{ $max: { highestScore: 100 } }

// Current date
{ $currentDate: { lastModified: true } }

// Array operations
{ $push: { tags: 'new-tag' } }              // Add to array
{ $pull: { tags: 'old-tag' } }              // Remove from array
{ $addToSet: { tags: 'unique-tag' } }       // Add if not exists
{ $pop: { tags: 1 } }                       // Remove last (-1 for first)
```

## Best Practices

### 1. Repository Layer

**✅ DO:**
- Đặt data access logic trong repository
- Tạo custom query methods trong repository
- Sử dụng type-safe queries
- Return Promise<T | null> cho single document queries

```typescript
✅ async findByEmail(email: string): Promise<User | null> {
  return this.findOne({ email: email.toLowerCase() });
}
```

**❌ DON'T:**
- Đặt business logic trong repository
- Direct database access bên ngoài repository
- Return raw query builders

```typescript
❌ async deleteUserAndNotify(userId: string): Promise<void> {
  // Business logic không thuộc repository
  await this.sendNotification(userId);
  await this.delete(userId);
}
```

### 2. Service Layer

**✅ DO:**
- Đặt business logic trong service
- Validate input data
- Use transactions cho complex operations
- Log important actions

```typescript
✅ async createUser(data: CreateUserDto): Promise<User> {
  this.logger.log('Creating user');

  // Validation
  await this.validateEmail(data.email);

  // Business logic
  const hashedPassword = await this.hashPassword(data.password);

  return this.userRepository.create({
    ...data,
    password: hashedPassword,
  });
}
```

**❌ DON'T:**
- Direct database queries từ service
- Skip validation

```typescript
❌ async createUser(data: any): Promise<User> {
  // No validation, no type safety
  return this.userRepository.create(data);
}
```

### 3. Schema Design

**✅ DO:**
- Sử dụng TypeScript types đầy đủ
- Thêm validation trong schema
- Tạo indexes cho fields hay query
- Use `select: false` cho sensitive data

```typescript
✅ @Prop({
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
})
email: string;
```

**❌ DON'T:**
- Thiếu validation
- Quên indexes
- Expose sensitive data

```typescript
❌ @Prop()
email: string;  // No validation, no constraints
```

### 4. Error Handling

```typescript
✅ async findUserOrThrow(userId: string): Promise<User> {
  const user = await this.userRepository.findById(userId);

  if (!user) {
    throw new NotFoundException(`User not found: ${userId}`);
  }

  return user;
}
```

### 5. Transactions

Cho operations cần atomic:

```typescript
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

constructor(
  @InjectConnection() private readonly connection: Connection,
  private readonly userRepository: UserRepository,
) {}

async transferOwnership(fromId: string, toId: string): Promise<void> {
  const session = await this.connection.startSession();
  session.startTransaction();

  try {
    await this.userRepository.findByIdAndUpdate(
      fromId,
      { $inc: { itemCount: -1 } },
      { session }
    );

    await this.userRepository.findByIdAndUpdate(
      toId,
      { $inc: { itemCount: 1 } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

## Testing

### Mock Repository

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  it('should create user', async () => {
    const userData = { email: 'test@example.com', name: 'Test' };
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(userData as User);

    const result = await service.createUser('test@example.com', 'Test', 'password');

    expect(result).toEqual(userData);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      name: 'Test',
    }));
  });
});
```

## Troubleshooting

### Connection Issues

```typescript
// Check connection status
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

constructor(@InjectConnection() private connection: Connection) {
  this.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  this.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
  });
}
```

### Query Performance

```typescript
// Enable query logging
const user = await this.model
  .find({ email })
  .explain('executionStats');  // Show query execution stats
```

### Index Issues

```typescript
// List all indexes
const indexes = await this.model.collection.getIndexes();
console.log(indexes);

// Create index manually
await this.model.collection.createIndex({ email: 1 }, { unique: true });
```
