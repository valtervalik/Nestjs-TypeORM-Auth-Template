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
import { TypedEventEmitter } from 'src/types/typed-event-emitter/typed-event-emitter.class';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Roles(UserRoles.SUPER)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const password = this.usersService.generatePassword(12);

    const user = await this.usersService.create(
      { ...createUserDto, password },
      activeUser,
    );

    this.eventEmitter.emit('user.welcome', {
      email: createUserDto.email,
      password,
    });

    return user;
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
