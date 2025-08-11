import { Test, TestingModule } from "@nestjs/testing";
import { GraphController } from "../graph.controller";
import { GraphService } from "../graph.service";
import { OptimizePathDto, OptimizeMultiDto } from "../dto/optimize.dto";
import { ShortestPathResponseDto } from "../dto/graph-response.dto";
import { JwtDecodedPayload } from "src/auth/jwt.schema";
import { Types } from "mongoose";

describe('Graphcontroller', () => {
    let controller: GraphController;
    let service: GraphService;

    const mockGraphService = {
        optimizeSingle: jest.fn(),
        optimizeMulti: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GraphController],
            providers: [{
                provide: GraphService, useValue: mockGraphService
            }]
        }).compile();

        controller = module.get(GraphController);
        service = module.get(GraphService)
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe('optimizeRoute (single)', () => {
        it('Should call service (optimizeSingle) with DTO and return Result', async () => {
            const dto: OptimizePathDto = {
                from: 'A',
                to: 'B',
                locations: [
                    { name: 'A', lat: 12.9716, lng: 77.5946 },
                    { name: 'B', lat: 13.0827, lng: 80.2707 },
                ],
            }
            const userMock: JwtDecodedPayload = { _id: new Types.ObjectId(), email: 'test@gmail.com' }
            const expected: ShortestPathResponseDto = {
                path: ['A', 'B'],
                distance: 50.123
            }
            mockGraphService.optimizeSingle.mockResolvedValue(expected)

            const result = await controller.optimizeRoute(dto, userMock)

            expect(mockGraphService.optimizeSingle).toHaveBeenCalledWith(dto)
            expect(result).toEqual(expected)
        })

    })
    describe('optimizeMultiRoute', () => {
        it('should call optiMulti wiht DTO and return result', async () => {
            const dto: OptimizeMultiDto = {
                optimize: [
                    {
                        from: 'A',
                        to: 'B',
                        locations: [
                            { name: 'A', lat: 12.9716, lng: 77.5946 },
                            { name: 'B', lat: 13.0827, lng: 80.2707 },
                        ]
                    }
                ]
            }
            const userMock: JwtDecodedPayload = {
                _id: new Types.ObjectId(),
                email: 'test@gmail.com'
            }
            const expected = {
                concurrentResults: [{ path: ['A', 'B'], distance: 50 }],
                sequentialResults: [{ path: ['A', 'B'], distance: 50 }],
            }
            mockGraphService.optimizeMulti.mockResolvedValue(expected)

            const result = await controller.optimizeMultiRoute(dto, userMock)

            expect(mockGraphService.optimizeMulti).toHaveBeenCalledWith(dto)
            expect(result).toEqual(expected)
        })
    })


})