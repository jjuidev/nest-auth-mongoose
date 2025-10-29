import { Inject } from '@nestjs/common';

import { LoggerService } from '../logger.service';

export const InjectLogger = () => Inject(LoggerService);
