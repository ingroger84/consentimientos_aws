import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../profiles/guards/permissions.guard';
import { RequirePermission } from '../profiles/decorators/require-permission.decorator';
import { ProfilesService } from '../profiles/profiles.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission('questions', 'create')
  create(@Body() createQuestionDto: CreateQuestionDto, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.questionsService.create(createQuestionDto, tenantId);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('questions', 'view')
  findAll(@Query('serviceId') serviceId?: string, @CurrentUser() user?: User) {
    const tenantId = user?.tenant?.id;
    if (serviceId) {
      return this.questionsService.findByService(serviceId, tenantId);
    }
    return this.questionsService.findAll(tenantId);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('questions', 'view')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.questionsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('questions', 'edit')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.questionsService.update(id, updateQuestionDto, tenantId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('questions', 'delete')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.questionsService.remove(id, tenantId);
  }
}
