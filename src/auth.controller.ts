import { Get, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @UseGuards(AuthGuard('jwt'))
    @Post('signup')
    async signUp(@Body() dto: SignUpDto) {
        return this.authService.signUp(dto.username, dto.email, dto.password);
    }
    @UseGuards(AuthGuard('jwt'))
    @Post('signin')
    async signIn(@Body() dto: SignInDto) {
        return this.authService.signIn(dto.email, dto.password);
    }
}
