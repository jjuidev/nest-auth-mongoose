# Architecture Documentation

## Overview

This project follows a **domain-driven modular architecture** based on NestJS best practices. The structure prioritizes business domains over technical concerns, making the codebase more maintainable, scalable, and intuitive.

## Core Principles

### 1. Business Domain First

The project structure is organized around **business problems**, not technical implementation details. Each module represents a feature or domain area that solves a specific business need.

**Benefits:**
- Faster feature location and bug fixing
- Easier onboarding for new developers
- Clear separation of concerns
- Modules can potentially be reused across projects

### 2. Module as the Building Block

Every feature is encapsulated in a **NestJS Module**. Think of each module as a "mini-onion" that aggregates into the full application architecture.

**What belongs in a module:**
- Controllers (HTTP layer)
- Services (business logic)
- DTOs (Data Transfer Objects)
- Entities/Models (data structures)
- Guards (authorization)
- Pipes (validation)
- Repositories (data access)

### 3. Two Domains

The architecture distinguishes between:

**Developer Domain:**
- Framework knowledge (NestJS, TypeScript)
- Technical implementation
- Infrastructure concerns

**Business Domain:**
- Problem-solving logic
- Feature requirements
- Domain rules

Keep these concerns separated within each module.

### 4. Core Module Pattern

Cross-cutting concerns that affect multiple modules belong in a **core module**:
- Database configuration
- Authentication setup
- Logging
- API documentation (Swagger)
- Common utilities
- Global guards/interceptors

## Project Structure

```
src/
├── core/                    # Cross-cutting concerns
│   ├── database/           # Database configuration
│   ├── config/             # Application configuration
│   └── common/             # Shared utilities, guards, filters
│
├── modules/                # Business domain modules
│   ├── auth/              # Authentication & authorization
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── guards/
│   │   ├── dto/
│   │   └── auth.module.ts
│   │
│   ├── users/             # User management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   ├── dto/
│   │   └── users.module.ts
│   │
│   └── [feature]/         # Other business features
│       ├── controllers/
│       ├── services/
│       ├── dto/
│       └── [feature].module.ts
│
├── app.module.ts           # Root module
└── main.ts                 # Application entry point
```

## Module Organization

### Simple Module Structure

For straightforward features:

```
users/
├── users.controller.ts
├── users.service.ts
├── users.module.ts
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
└── entities/
    └── user.entity.ts
```

### Complex Module Structure

For features with multiple sub-domains:

```
blog/
├── drafting/
│   ├── drafting.controller.ts
│   ├── drafting.service.ts
│   └── drafting.module.ts
├── publishing/
│   ├── publishing.controller.ts
│   ├── publishing.service.ts
│   └── publishing.module.ts
├── dto/
├── entities/
└── blog.module.ts
```

## Dependency Injection

NestJS's DI system enables:
- Loose coupling between modules
- Easy testing with mock services
- Clear dependency trees
- Automatic service instantiation

**Example:**
```typescript
@Module({
  imports: [DatabaseModule], // Import other modules
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export for use in other modules
})
export class UsersModule {}
```

## Naming Conventions

- **Modules:** `[feature].module.ts` (e.g., `users.module.ts`)
- **Controllers:** `[feature].controller.ts` (e.g., `users.controller.ts`)
- **Services:** `[feature].service.ts` (e.g., `users.service.ts`)
- **DTOs:** `[action]-[feature].dto.ts` (e.g., `create-user.dto.ts`)
- **Entities:** `[feature].entity.ts` (e.g., `user.entity.ts`)

## File Size Guidelines

- Keep files focused on a single responsibility
- If a file exceeds 200-300 lines, consider splitting it
- Break down complex services into multiple specialized services
- Extract shared logic into separate utility files

## Creating New Features

1. **Identify the business domain** - What problem does this solve?
2. **Generate the module** - Use NestJS CLI: `nest g module modules/[feature]`
3. **Add components** - Controllers, services, DTOs as needed
4. **Define dependencies** - Import required modules
5. **Export public APIs** - Make reusable parts available to other modules

## Best Practices

### DO:
- ✅ Organize by business domain
- ✅ Use NestJS CLI for consistent generation
- ✅ Keep modules focused and cohesive
- ✅ Export only what other modules need
- ✅ Use DTOs for validation and type safety
- ✅ Implement guards and interceptors at module level when possible

### DON'T:
- ❌ Create "helpers" or "utils" folders as top-level concerns
- ❌ Mix unrelated business logic in one module
- ❌ Tightly couple modules (use imports/exports)
- ❌ Duplicate code across modules (extract to core or shared)
- ❌ Skip DTOs for request/response validation

## Testing Strategy

Each module should have:
- **Unit tests** for services (`*.service.spec.ts`)
- **Controller tests** for endpoints (`*.controller.spec.ts`)
- **Integration tests** for complete flows (in `test/` directory)

## Migration Guide

When adding new features:
1. Create a new module under `src/modules/[feature]`
2. Define the module's public interface (exported services)
3. Import the module in `app.module.ts` or parent module
4. Keep all related files within the module directory

## References

- [Original Blog Post](https://dev.to/smolinari/nestjs-and-project-structure-what-to-do-1223)
- [NestJS Documentation](https://docs.nestjs.com)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
