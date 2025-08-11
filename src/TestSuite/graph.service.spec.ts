import { Test, TestingModule } from "@nestjs/testing";
import { GraphService } from "../graph.service";
import { OptimizePathDto, OptimizeMultiDto } from "../dto/optimize.dto";

describe('GraphService', () => {
    let service: GraphService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GraphService],
        }).compile();

        service = module.get(GraphService)
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    })

    describe('optimizeSingle', () => {
        it('should return a Valid path frorm A to  C', async () => {
            const dto: OptimizePathDto = {
                from: 'A',
                to: 'C',
                locations: [
                    { name: 'A', lat: 12.9716, lng: 77.5946 },
                    { name: 'B', lat: 13.0827, lng: 80.2707 },
                    { name: 'C', lat: 17.3850, lng: 78.4867 },
                ],
            };
            const result = await service.optimizeSingle(dto)

            expect(result).toBeDefined();
            expect(result).toHaveProperty('path');
            expect(result).toHaveProperty('distance');
            expect(Array.isArray(result.path)).toBe(true);
            expect(typeof result.distance).toBe('number');
            expect(result.distance).toBeGreaterThan(0)
            expect(result.path[0]).toBe('A');
            expect(result.path[result.path.length - 1]).toBe('C')
        });
        it('should return a valid path in direct Travel from A to B', async () => {
            const dto: OptimizePathDto = {
                from: 'A',
                to: 'B',
                locations: [
                    { name: 'A', lat: 12.9716, lng: 77.5946 },
                    { name: 'B', lat: 13.0827, lng: 80.2707 },
                ]
            }
            const result = await service.optimizeSingle(dto);

            expect(result.path).toEqual(['A', 'B'])
            expect(result.distance).toBeGreaterThan(0)
        })
    })
    describe('OptimizeMulti', () => {
        it('Should return a Both seq and concurrent results', async () => {
            const dto: OptimizeMultiDto = {
                optimize: [
                    {
                        from: 'A',
                        to: 'C',
                        locations: [
                            { name: 'A', lat: 12.9716, lng: 77.5946 },
                            { name: 'B', lat: 13.0827, lng: 80.2707 },
                            { name: 'C', lat: 17.3850, lng: 78.4867 },
                        ],
                    },
                    {
                        from: 'B',
                        to: 'A',
                        locations: [
                            { name: 'A', lat: 12.9716, lng: 77.5946 },
                            { name: 'B', lat: 13.0827, lng: 80.2707 },
                            { name: 'C', lat: 17.3850, lng: 78.4867 },
                        ],
                    },
                ],
            };
            const result = await service.optimizeMulti(dto);

            expect(result).toHaveProperty('concurrentResults');
            expect(result).toHaveProperty('sequentialResults');
            expect(result.concurrentResults.length).toBe(2);
            expect(result.sequentialResults.length).toBe(2)
        })
    })
})