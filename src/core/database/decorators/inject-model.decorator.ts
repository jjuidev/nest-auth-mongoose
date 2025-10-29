import { Inject } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

export const InjectModel = (model: string) => Inject(getModelToken(model));
