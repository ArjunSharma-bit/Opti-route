import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
    @ApiProperty({ example: 'JEsusISLOvz' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'Honda@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class SignInDto {
    @ApiProperty({ example: 'NotHonda@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'NotPassword' })
    @IsString()
    password: string;
}
