import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShortestPathResponseDto {
  @ApiProperty({ example: ['A', 'C', 'E'] })
  @IsString()
  path: string[];

  @ApiProperty({ example: 14.56 })
  distance: number;
}

export class ShortestMultiResponseDto {
  @ApiProperty({ type: [ShortestPathResponseDto] })
  results: ShortestPathResponseDto[];

}



