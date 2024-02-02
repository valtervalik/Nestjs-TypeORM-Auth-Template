import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService extends BaseService<Permission>(Permission) {}
