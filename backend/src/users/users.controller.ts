import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_USERS)
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.usersService.create(createUserDto, tenantId);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  async findAll(@CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Si el usuario tiene tenant, SOLO ver usuarios de su tenant
    // Si es Super Admin (sin tenant), ver todos los usuarios
    const tenantId = user.tenant?.id;
    const users = await this.usersService.findAll(tenantId);
    
    return users;
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar acceso
    const tenantId = user.tenant?.id;
    return this.usersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_USERS)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar que solo se editen usuarios del mismo tenant
    const tenantId = user.tenant?.id;
    return this.usersService.update(id, updateUserDto, tenantId);
  }

  @Patch(':id/change-password')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CHANGE_PASSWORDS)
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar que solo se cambien contraseñas de usuarios del mismo tenant
    const tenantId = user.tenant?.id;
    return this.usersService.changePassword(id, changePasswordDto.newPassword, tenantId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DELETE_USERS)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar que solo se eliminen usuarios del mismo tenant
    const tenantId = user.tenant?.id;
    return this.usersService.remove(id, tenantId);
  }
}
