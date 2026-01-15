import { SetMetadata } from '@nestjs/common';
import { ResourceType } from '../guards/resource-limit.guard';

export const RESOURCE_TYPE_KEY = 'resourceType';
export const CheckResourceLimit = (resourceType: ResourceType) =>
  SetMetadata(RESOURCE_TYPE_KEY, resourceType);
