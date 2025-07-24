import { Module } from '@nestjs/common';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';

@Module({
  imports: [],
  controllers: [GraphController],
  providers: [GraphService],
})

export class AppModule { }
