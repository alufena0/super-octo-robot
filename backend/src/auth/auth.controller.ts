import { Controller, Post, Body } from '@nestjs/common';
import { IsString, IsEmail, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto.email, dto.password, dto.name);
    // Após cadastrar, já faz login automático para retornar o token —
    // assim o frontend não precisa de uma segunda chamada.
    return this.authService.login(dto.email, dto.password);
  }
}
