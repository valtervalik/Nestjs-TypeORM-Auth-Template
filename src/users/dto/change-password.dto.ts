import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  oldPassword: string;

  @IsStrongPassword()
  password: string;

  @IsStrongPassword()
  confirmPassword: string;
}
