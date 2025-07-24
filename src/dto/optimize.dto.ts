import { IsString, IsNumber, IsArray, ValidateNested } from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
    @ApiProperty({ example: 'A', description: 'Name of the location' })
    @IsString()
    name: string;

    @ApiProperty({ example: 28.6139, description: 'Latitude of the location' })
    @IsNumber()
    lat: number;

    @ApiProperty({ example: 77.2090, description: 'Longitude of the location' })
    @IsNumber()
    lng: number;
}

export class OptimizePathDto {
    @ApiProperty({ type: [LocationDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LocationDto)
    locations: LocationDto[];

    @ApiProperty({ example: 'A' })
    @IsString()
    from: string;

    @ApiProperty({ example: 'C' })
    @IsString()
    to: string;
}

export class OptimizeMultiDto {
    @ApiProperty({ type: [OptimizePathDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptimizePathDto)
    optimize: OptimizePathDto[];
}