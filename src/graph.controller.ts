import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { GraphService } from './graph.service';
import { OptimizeMultiDto, OptimizePathDto } from './dto/optimize.dto';
import { ShortestPathResponseDto } from './dto/graph-response.dto';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { error } from 'console';

@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) { }

  @Post('opti-single')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Optimizes Path',
    description: 'Optimzes Route for a Single request Body'
  })
  @ApiResponse({
    status: 200, description: 'Optimizes a route for a Single Request Body'
  })
  @ApiBadRequestResponse({ description: 'Unable to Optimize The Path' })
  async optimizeRoute(@Body() dto: OptimizePathDto): Promise<ShortestPathResponseDto> {
    try {
      return await this.graphService.optimizeSingle(dto);
    } catch (err) { throw err }
  }

  @Post('opti-multi')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Optimizes Multi Path',
    description: 'Optimzes Routes for Multiple request Bodies'
  })
  @ApiResponse({
    status: 200, description: 'Optimizes Routes for Multiple Request Bodies'
  })
  @ApiBadRequestResponse({ description: 'Unable to Optimize The Path' })
  async optimizeMultiRoute(@Body() dto: OptimizeMultiDto): Promise<any> {
    try {
      return await this.graphService.optimizeMulti(dto);
    } catch (err) { throw error }

  }
}


