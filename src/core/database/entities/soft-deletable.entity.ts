import { Prop } from '@nestjs/mongoose';

import { Document } from '../';

export abstract class SoftDeletableEntity extends Document {
	@Prop({ type: Date, default: null })
	deletedAt?: Date | null;

	@Prop({ type: String, default: null })
	deletedBy?: string | null;
}
