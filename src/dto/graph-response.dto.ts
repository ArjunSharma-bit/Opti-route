import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class ShortestPathResponseDto {
  @ApiProperty({ example: ['A', 'C', 'E'] })
  @IsArray()
  path: string[];

  @ApiProperty({ example: 14.56 })
  @IsNumber()
  distance: number;
}

export class ShortestMultiResponseDto {
  @ApiProperty({ type: [ShortestPathResponseDto] })
  concurrentResults: ShortestPathResponseDto[];

  @ApiProperty({ type: [ShortestPathResponseDto] })
  sequentialResults: ShortestPathResponseDto[];

}
