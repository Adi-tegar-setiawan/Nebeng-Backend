import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/repositories/user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserMapper } from '../users/mappers/user.mapper';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { Role } from '../../generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    return this.usersService.create({
      ...registerDto,
      role: registerDto.role || Role.customer,
    });
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: UserResponseDto }> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Akun Anda sedang ditangguhkan atau diblokir',
      );
    }

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: UserMapper.toResponse(user),
    };
  }
}
