import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('bootstrap-admin')
  async bootstrapAdmin(@Body() dto: BootstrapAdminDto, @Req() req: Request) {
    const token = req.headers['x-bootstrap-token'] as string | undefined;

    const data = await this.service.bootstrapAdmin(
      dto.email,
      dto.password,
      token,
    );

    return { message: '관리자 부트스트랩 완료', data };
  }

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
