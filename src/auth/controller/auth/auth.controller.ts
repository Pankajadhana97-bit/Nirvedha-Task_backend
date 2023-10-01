import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { getCurrentUser, getCurrentUserId } from 'src/common/decorators';
import { AccessTokenGuard, RefreshTokenGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/local/signup')
    @HttpCode(HttpStatus.CREATED)
    signuplocal(@Body() dto: AuthDto) {
        return this.authService.signupLocal(dto)
    }

    @Post('local/signin')
    @HttpCode(HttpStatus.OK)
    signinlocal(@Body() dto: AuthDto) {
        return this.authService.signinLocal(dto)
    }

    @UseGuards(AccessTokenGuard)
    @Post('/logout')
    @HttpCode(HttpStatus.OK)
    logout(@getCurrentUserId() userId: number) {
        return this.authService.logout(userId)
    }

    @UseGuards(RefreshTokenGuard)
    @Post('/refresh')
    @HttpCode(HttpStatus.OK)
    refreshtoken(@getCurrentUserId() userId: number, @getCurrentUser('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(userId, refreshToken)
    }

}
