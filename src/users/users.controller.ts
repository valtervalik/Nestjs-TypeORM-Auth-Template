import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/auth/authorization/decorators/roles.decorator';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { UserRoles } from 'src/roles/enums/user-roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Roles(UserRoles.Super)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const password = this.usersService.generatePassword(12);

    return this.usersService.create({ ...createUserDto, password }, activeUser);
  }

  @Get()
  findAll(@Query() { page = '1', limit = '10' }) {
    return this.usersService.findAll({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id: +id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.usersService.update(+id, updateUserDto, activeUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() activeUser: ActiveUserData) {
    return this.usersService.remove(+id, activeUser);
  }
}
