import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('signup')
    @HttpCode(201)
    @ApiOperation({
        summary: 'Initiates Signup for Users',
        description: 'Sign Up Here'
    })
    @ApiResponse({ status: 200, description: 'Initiates Signing Up' })
    @ApiBadRequestResponse({ description: 'Unable To Sign up' })
    async signUp(@Body() dto: SignUpDto) {
        return this.authService.signUp(dto.username, dto.email, dto.password);
    }
    @ApiOperation({
        summary: 'Initiates Signin for Users',
        description: 'Sign in Here'
    })
    @ApiResponse({ status: 200, description: 'Initiates Signing In' })
    @ApiBadRequestResponse({ description: 'Unable To Sign in' })
    @HttpCode(200)
    @Post('signin')
    async signIn(@Body() dto: SignInDto) {
        return this.authService.signIn(dto.email, dto.password);
    }
}
