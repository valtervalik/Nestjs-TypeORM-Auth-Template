import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  exports: [TypeOrmModule],
  providers: [PermissionsService],
})
export class PermissionsModule {}
