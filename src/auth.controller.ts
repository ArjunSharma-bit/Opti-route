import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signUp(@Body() dto: SignUpDto) {
        return this.authService.signUp(dto.username, dto.email, dto.password);
    }

    @Post('signin')
    async signIn(@Body() dto: SignInDto) {
        return this.authService.signIn(dto.email, dto.password);
    }
}
