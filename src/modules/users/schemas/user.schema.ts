import { Prop, Schema, SchemaFactory, AuditableEntity } from '@/core/database';

@Schema({
	timestamps: true,
	collection: 'users',
	versionKey: false,
})
export class User extends AuditableEntity {
	@Prop({
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	})
	email: string;

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 100,
	})
	name: string;

	@Prop({
		required: true,
		select: false,
	})
	password: string;

	@Prop({
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	})
	role: string;

	@Prop({ default: true })
	isActive: boolean;

	@Prop()
	lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
