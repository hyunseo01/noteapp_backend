import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signin')
  async signin(@Body() dto: SigninDto, @Req() req: any) {
    const sessionUser = await this.service.signin(dto.email, dto.password);
    req.session.user = sessionUser;
    return {
      message: '로그인 성공',
      data: sessionUser,
    };
  }

  @Post('signout')
  async signout(@Req() req: any) {
    await new Promise<void>((r) => req.session.destroy(() => r()));
    return { message: '로그아웃', data: null };
  }

  @Get('me')
  me(@Req() req: any) {
    return {
      message: 'me',
      data: req.session?.user ?? null,
    };
  }
}
