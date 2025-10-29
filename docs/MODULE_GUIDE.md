# Module Structure Guide

## Quick Start

This guide helps you create well-structured modules following the project's domain-driven architecture.

## Creating a New Module

### 1. Using NestJS CLI (Recommended)

```bash
# Generate a new module
nest g module modules/[feature-name]

# Generate controller
nest g controller modules/[feature-name] --no-spec

# Generate service
nest g service modules/[feature-name] --no-spec
```

### 2. Manual Creation

If creating manually, follow this structure:

```
src/modules/[feature-name]/
├── [feature-name].module.ts
├── [feature-name].controller.ts
├── [feature-name].service.ts
├── dto/
│   ├── create-[feature].dto.ts
│   └── update-[feature].dto.ts
└── entities/
    └── [feature].entity.ts
```

## Module Template

### Basic Module

```typescript
// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export if other modules need this service
})
export class UsersModule {}
```

### Controller Template

```typescript
// src/modules/users/users.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### Service Template

```typescript
// src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  findAll() {
    // Implementation
  }

  findOne(id: string) {
    // Implementation
  }

  create(createUserDto: CreateUserDto) {
    // Implementation
  }
}
```

### DTO Template

```typescript
// src/modules/users/dto/create-user.dto.ts
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
```

## Module Categories

### 1. Feature Modules

**Purpose:** Implement specific business features

**Examples:** users, products, orders, posts

**Characteristics:**
- Self-contained business logic
- Clear responsibility
- May depend on other modules
- Should be potentially reusable

### 2. Shared Modules

**Purpose:** Provide common functionality across features

**Location:** `src/core/` or specific shared modules

**Examples:**
- Database connections
- Authentication utilities
- Logging services
- Validation pipes

### 3. Core Module

**Purpose:** Global configuration and cross-cutting concerns

**Location:** `src/core/core.module.ts`

**Contains:**
- Application configuration
- Database setup
- Global guards/interceptors
- Common utilities

**Note:** Mark as `@Global()` to avoid re-importing

## Module Dependencies

### Importing Other Modules

```typescript
@Module({
  imports: [
    UsersModule,      // Import other feature modules
    DatabaseModule,   // Import infrastructure modules
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
```

### Exporting Services

```typescript
@Module({
  providers: [UsersService],
  exports: [UsersService], // Make available to importing modules
})
export class UsersModule {}
```

### Dynamic Modules

For configurable modules:

```typescript
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
      ],
      exports: ['DATABASE_OPTIONS'],
    };
  }
}
```

## Guards and Interceptors

### Module-Level Guard

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
```

### Controller-Level Guard

```typescript
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  // All routes protected
}
```

### Route-Level Guard

```typescript
@Get('profile')
@UseGuards(AuthGuard)
getProfile() {
  // Only this route protected
}
```

## Validation with DTOs

### Setup

Install required packages (already included in this project):

```bash
npm install class-validator class-transformer
```

### Enable global validation

```typescript
// src/main.ts
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### DTO with Validation

```typescript
import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

## Error Handling

### Service-Level

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  findOne(id: string) {
    const user = this.users.find(u => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
```

### Exception Filters

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}
```

## Testing Modules

### Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Controller Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

## Common Patterns

### Repository Pattern

```typescript
// users.repository.ts
@Injectable()
export class UsersRepository {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = { id: generateId(), ...userData };
    this.users.push(user);
    return user;
  }
}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll() {
    return this.usersRepository.findAll();
  }
}
```

### Factory Pattern

```typescript
@Injectable()
export class UserFactory {
  create(dto: CreateUserDto): User {
    return {
      id: generateId(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
```

## Checklist for New Modules

- [ ] Module file created with appropriate imports/exports
- [ ] Controller(s) implement RESTful patterns
- [ ] Service(s) contain business logic
- [ ] DTOs defined for input validation
- [ ] Entities/interfaces for data structures
- [ ] Guards/pipes for security and validation
- [ ] Unit tests for services
- [ ] Controller tests for endpoints
- [ ] Module imported in parent module (usually `app.module.ts`)
- [ ] Documentation updated if needed

## Best Practices Summary

1. **One responsibility per module** - Each module should solve one business problem
2. **Use DTOs everywhere** - Validate all inputs with class-validator
3. **Keep services thin** - Extract complex logic into separate classes
4. **Export selectively** - Only export what other modules need
5. **Test thoroughly** - Every service and controller should have tests
6. **Use dependency injection** - Never use `new` keyword for services
7. **Handle errors properly** - Use NestJS exceptions consistently
8. **Document public APIs** - Add comments for exported services

## References

- [NestJS Modules Documentation](https://docs.nestjs.com/modules)
- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Providers](https://docs.nestjs.com/providers)
- [Class Validator](https://github.com/typestack/class-validator)
