import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { EncryptingModule } from 'src/common/encrypting/encrypting.module';
import { HashingModule } from 'src/common/hashing/hashing.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { RolesModule } from 'src/roles/roles.module';
import { UserSubscriber } from 'src/subscribers/user.subscriber';
import { UsersModule } from 'src/users/users.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { AuthGuard } from './authentication/guards/auth.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import { TwoFactorAuthService } from './authentication/two-factor-auth/two-factor-auth.service';
import { PermissionsGuard } from './authorization/guards/permissions.guard';
import { RolesGuard } from './authorization/guards/roles.guard';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    PermissionsModule,
    RolesModule,
    UsersModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    HashingModule,
    EncryptingModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    AuthenticationService,
    TwoFactorAuthService,
    UserSubscriber,
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthModule {}
