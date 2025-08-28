import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
    @ApiProperty({ example: 'JEsusISLOvz' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'HondaKAwasaki@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '8Ass#030' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class SignInDto {
    @ApiProperty({ example: 'HondaKAwasaki@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '8Ass#030' })
    @IsString()
    password: string;
}
