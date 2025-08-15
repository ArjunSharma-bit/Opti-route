import { Controller, Post, Body, HttpCode, UseGuards, } from '@nestjs/common';
import { GraphService } from './graph.service';
import { OptimizeMultiDto, OptimizePathDto } from './dto/optimize.dto';
import { ShortestMultiResponseDto, ShortestPathResponseDto } from './dto/graph-response.dto';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { error } from 'console';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './common/decorators/current-user.decorators';
import { JwtDecodedPayload } from './auth/jwt.schema';
@Controller('graph')
export class GraphController {

  constructor(private readonly graphService: GraphService) { }

  @UseGuards(AuthGuard('jwt'))
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
  async optimizeRoute(
    @Body() dto: OptimizePathDto,
    @CurrentUser() user: JwtDecodedPayload)
    : Promise<ShortestPathResponseDto> {
    try {
      console.log('User', user)
      return Object.assign(new ShortestPathResponseDto(), await this.graphService.optimizeSingle(dto));
    } catch (err) { throw err }
  }
  @UseGuards(AuthGuard('jwt'))
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
  async optimizeMultiRoute(
    @Body() dto: OptimizeMultiDto,
    @CurrentUser() user: JwtDecodedPayload
  ): Promise<ShortestMultiResponseDto> {
    try {
      console.log('User', user)
      return Object.assign(new ShortestMultiResponseDto(), await this.graphService.optimizeMulti(dto));
    } catch (err) {
      throw err;
    }

  }
}


