# Logger Usage Guide

## Overview

Project sử dụng **Pino** làm logging engine, nhưng được wrap lại trong `LoggerService` của project để đảm bảo consistent API và dễ maintain.

## Quy Tắc Quan Trọng

**LUÔN LUÔN import từ project's logger, KHÔNG BAO GIỜ import trực tiếp từ `nestjs-pino`:**

```typescript
// ✅ ĐÚNG - Import từ project
import { LoggerService, InjectLogger } from '@/core/logger';

// ❌ SAI - Không import trực tiếp từ lib
import { Logger } from 'nestjs-pino';
import { PinoLogger } from 'nestjs-pino';
```

## Các Cách Sử Dụng

### 1. Sử Dụng @InjectLogger Decorator (Khuyên Dùng)

Decorator tự động inject và set context, không cần gọi `setContext()` thủ công:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectLogger, LoggerService } from '@/core/logger';

@Injectable()
export class UsersService {
  @InjectLogger()
  private readonly logger: LoggerService;

  findAll() {
    this.logger.log('Finding all users');
    return [];
  }

  findOne(id: string) {
    this.logger.debug(`Finding user with id: ${id}`);
    try {
      // logic
    } catch (error) {
      this.logger.error('Failed to find user', error.stack);
    }
  }
}
```

**Với custom context:**

```typescript
@Injectable()
export class ProductsService {
  @InjectLogger('CustomProductContext')
  private readonly logger: LoggerService;

  create(data: CreateProductDto) {
    this.logger.log('Creating new product');
  }
}
```

### 2. Constructor Injection (Manual Context)

Nếu cần kiểm soát nhiều hơn, inject thủ công và set context:

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/core/logger';

@Injectable()
export class OrdersService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(OrdersService.name);
  }

  process() {
    this.logger.log('Processing order');
  }
}
```

## Log Levels

LoggerService hỗ trợ các log levels sau (theo thứ tự từ nghiêm trọng nhất):

```typescript
// Fatal - Lỗi nghiêm trọng, ứng dụng không thể tiếp tục
this.logger.fatal('Database connection lost');

// Error - Lỗi cần xử lý
this.logger.error('Failed to process payment', error.stack);

// Warn - Cảnh báo
this.logger.warn('API rate limit approaching');

// Log/Info - Thông tin chung
this.logger.log('User logged in successfully');

// Debug - Debug information
this.logger.debug('Processing request', { userId, requestId });

// Verbose/Trace - Chi tiết nhất
this.logger.verbose('Detailed trace information');
```

## Context

Context giúp xác định log đến từ đâu. **LUÔN set context cho logger:**

```typescript
// ✅ ĐÚNG
constructor(private readonly logger: LoggerService) {
  this.logger.setContext(UsersService.name);
}

// ✅ ĐÚNG - Custom context
constructor(private readonly logger: LoggerService) {
  this.logger.setContext('PaymentProcessor');
}

// ❌ SAI - Không set context
constructor(private readonly logger: LoggerService) {
  // Missing setContext
}
```

## Logging với Additional Data

```typescript
// Log với object data
this.logger.log('User created', { userId, email, role });

// Error với stack trace
try {
  await riskyOperation();
} catch (error) {
  this.logger.error('Operation failed', error.stack, {
    operation: 'riskyOperation',
    userId
  });
}

// Debug với detailed data
this.logger.debug('Processing request', {
  requestId,
  userId,
  timestamp: new Date(),
  payload: sanitizedPayload
});
```

## Configuration

Logger được config trong `LoggerModule` với các settings:

**Development:**
- Pretty print với colors
- Human-readable format
- Show timestamp, context

**Production:**
- JSON format
- Machine-readable
- Optimized performance

Các environment variables:
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Minimum log level (fatal/error/warn/info/debug/trace)

## Best Practices

### 1. Dùng @InjectLogger Decorator

```typescript
✅ @InjectLogger()
   private readonly logger: LoggerService;

✅ @InjectLogger('CustomContext')
   private readonly logger: LoggerService;

⚠️  constructor(private readonly logger: LoggerService) {
     this.logger.setContext(MyService.name);  // Manual, chỉ khi cần thiết
   }
```

### 2. Import từ Project

```typescript
✅ import { LoggerService } from '@/core/logger';
❌ import { Logger } from 'nestjs-pino';
```

### 3. Log ở Đúng Level

```typescript
✅ this.logger.error('Failed to save', error.stack);  // Lỗi nghiêm trọng
✅ this.logger.warn('Deprecated API used');          // Cảnh báo
✅ this.logger.log('User login successful');         // Info chung
✅ this.logger.debug('Cache hit', { key });          // Debug info

❌ this.logger.error('User login successful');       // Không phải error
❌ this.logger.log('Database crashed');              // Nên dùng error/fatal
```

### 4. Sensitive Data

**KHÔNG BAO GIỜ log sensitive data:**

```typescript
❌ this.logger.log('User logged in', { password, creditCard });

✅ this.logger.log('User logged in', {
  userId,
  email: maskEmail(email)
});
```

### 5. Structured Logging

Dùng objects thay vì string concatenation:

```typescript
✅ this.logger.log('Order created', { orderId, userId, amount });

❌ this.logger.log(`Order ${orderId} created by ${userId} with amount ${amount}`);
```

## Example: Complete Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectLogger, LoggerService } from '@/core/logger';

@Injectable()
export class PaymentService {
  @InjectLogger()
  private readonly logger: LoggerService;

  async processPayment(orderId: string, amount: number) {
    this.logger.log('Processing payment', { orderId, amount });

    try {
      this.logger.debug('Validating payment details', { orderId });

      // validation logic

      this.logger.debug('Calling payment gateway', { orderId });

      // payment gateway call

      this.logger.log('Payment successful', { orderId, amount });

      return { success: true };
    } catch (error) {
      this.logger.error(
        'Payment failed',
        error.stack,
        { orderId, amount, errorMessage: error.message }
      );

      throw error;
    }
  }
}
```

## HTTP Request Logging

HTTP requests được tự động log bởi `pino-http` middleware với format:

```json
{
  "level": "info",
  "time": 1234567890,
  "context": "HTTP",
  "req": {
    "id": "uuid",
    "method": "GET",
    "url": "/api/users"
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 45
}
```

Health check và metrics endpoints được ignore tự động.

## Troubleshooting

### Logger không xuất logs

```typescript
// Kiểm tra đã dùng @InjectLogger chưa
@InjectLogger()
private readonly logger: LoggerService;

// Kiểm tra LOG_LEVEL trong .env
// LOG_LEVEL=debug
```

### Format không đẹp trong development

```typescript
// Kiểm tra NODE_ENV
// NODE_ENV=development

// Kiểm tra pino-pretty đã install chưa
// npm install -D pino-pretty
```

### Logs không có context

```typescript
// Đảm bảo dùng @InjectLogger decorator (auto set context)
@InjectLogger()
private readonly logger: LoggerService;

// Hoặc với custom context
@InjectLogger('MyCustomContext')
private readonly logger: LoggerService;

// Hoặc manual trong constructor
constructor(private readonly logger: LoggerService) {
  this.logger.setContext(MyService.name);
}
```
