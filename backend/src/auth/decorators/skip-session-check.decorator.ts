import { SetMetadata } from '@nestjs/common';

export const SkipSessionCheck = () => SetMetadata('skipSessionCheck', true);
