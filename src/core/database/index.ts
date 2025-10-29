export { DatabaseModule } from './database.module';

export { BaseRepository } from './repositories/base.repository';
export { SoftDeletableRepository } from './repositories/soft-deletable.repository';
export { AuditableRepository } from './repositories/auditable.repository';

export { BaseService } from './services/base.service';
export { SoftDeletableService } from './services/soft-deletable.service';
export { AuditableService } from './services/auditable.service';

export { SoftDeletableEntity } from './entities/soft-deletable.entity';
export { AuditableEntity } from './entities/auditable.entity';

export type { IRepository } from './interfaces/repository.interface';
export type { PaginationOptions, PaginatedResult } from './interfaces/pagination.interface';

export { InjectModel } from './decorators/inject-model.decorator';
export { Schema, Prop, SchemaFactory } from './decorators/schema.decorator';
export type { SchemaOptions } from './decorators/schema.decorator';

export { Document } from 'mongoose';
export type { Model } from 'mongoose';
export type {
	FilterQuery,
	ProjectionType,
	QueryOptions,
	UpdateQuery,
	ClientSession,
} from 'mongoose';
