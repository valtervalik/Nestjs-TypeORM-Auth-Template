import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permissions } from 'src/auth/authorization/decorators/permissions.decorator';
import { Roles } from 'src/auth/authorization/decorators/roles.decorator';
import { Permission } from 'src/auth/authorization/permission.type';
import { UserRoles } from 'src/roles/enums/user-roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRoles.Super)
  @Permissions(Permission.CreateUser)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAllWithoutPagination({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id: +id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
