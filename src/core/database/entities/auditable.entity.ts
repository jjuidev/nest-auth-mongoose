import { Prop } from '@nestjs/mongoose';

import { SoftDeletableEntity } from './soft-deletable.entity';

export abstract class AuditableEntity extends SoftDeletableEntity {
	@Prop({ type: String, default: null })
	createdBy?: string | null;

	@Prop({ type: String, default: null })
	updatedBy?: string | null;

	createdAt: Date;
	updatedAt: Date;
}
