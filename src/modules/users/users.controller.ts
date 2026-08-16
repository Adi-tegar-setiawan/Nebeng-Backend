import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Membuat pengguna baru' })
  @ApiResponse({
    status: 201,
    description: 'Pengguna berhasil dibuat',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'payload tidak valid' })
  @ApiResponse({
    status: 409,
    description: 'Email atau Nomor HP sudah terdaftar',
  })
  create(@Body() CreateUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(CreateUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua daftar pengguna' })
  @ApiResponse({
    status: 200,
    description: 'Daftar pengguna berhasil diambil',
    type: [UserResponseDto],
  })
  findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail pengguna berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail pengguna ditemukan',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Memperbarui data pengguna berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Data pengguna berhasil diperbarui',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mengubah status user (Active/Suspended/Blocked)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateStatus(id, updateUserStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus pengguna berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Pengguna berhasil dihapus',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  remove(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.remove(id);
  }
}
