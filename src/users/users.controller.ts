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
import { apiResponseHandler } from 'src/utils/apiResponseHandler';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Roles(UserRoles.SUPER)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const password = this.usersService.generatePassword(12);

    const newUser = await this.usersService.create(
      { ...createUserDto, password },
      activeUser,
    );

    return apiResponseHandler('User created successfully', 201, newUser);
  }

  @Get()
  findAll(@Query() { page = 1, limit = 10 }: { page: number; limit: number }) {
    return this.usersService.findAll({}, { page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const updatedUser = await this.usersService.update(
      id,
      updateUserDto,
      { new: true },
      activeUser,
    );

    return apiResponseHandler('User updated successfully', 200, updatedUser);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);

    return apiResponseHandler('User deleted successfully', 200);
  }
}
