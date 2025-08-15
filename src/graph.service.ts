import { Injectable } from '@nestjs/common';
import { OptimizePathDto, OptimizeMultiDto } from './dto/optimize.dto';
import { ShortestMultiResponseDto, ShortestPathResponseDto } from './dto/graph-response.dto';

@Injectable()
export class GraphService {
  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private optimize(dto: OptimizePathDto): { path: string[]; distance: number } {
    const { locations, from, to } = dto;
    const coords = new Map(locations.map(l => [l.name, { lat: l.lat, lng: l.lng }]));
    const graph = new Map<string, Map<string, number>>();

    coords.forEach((c1, n1) => {
      const neighbors = new Map<string, number>();
      coords.forEach((c2, n2) => {
        if (n1 !== n2)
          neighbors.set(n2, this.haversine(c1.lat, c1.lng, c2.lat, c2.lng));
      });
      graph.set(n1, neighbors);
    });

    const dijkstra = (start: string, end: string) => {
      const distances = new Map<string, number>(Array.from(graph.keys()).map(n => [n, n === start ? 0 : Infinity]));
      const previous = new Map<string, string | null>();
      const pq: [number, string][] = [[0, start]];
      const visited = new Set<string>();

      while (pq.length) {
        pq.sort((a, b) => a[0] - b[0]);
        const [d, node] = pq.shift()!;
        if (visited.has(node)) continue;
        visited.add(node);
        for (const [nb, weight] of graph.get(node) ?? []) {
          const alt = d + weight;
          if (alt < (distances.get(nb) ?? Infinity)) {
            distances.set(nb, alt);
            previous.set(nb, node);
            pq.push([alt, nb]);
          }
        }
      }

      const path: string[] = [];
      let curr: string | null = end;
      while (curr) {
        path.unshift(curr);
        curr = previous.get(curr) ?? null;
      }
      return { path, distance: distances.get(end) ?? Infinity };
    };

    const visited = new Set([from]);
    const path = [from];
    let totalDistance = 0;
    let current = from;

    while (visited.size < locations.length - 1) {
      let nearest = '', minDist = Infinity;
      for (const [name] of coords) {
        if (!visited.has(name) && name !== to) {
          const { distance } = dijkstra(current, name);
          if (distance < minDist) {
            minDist = distance;
            nearest = name;
          }
        }
      }
      if (!nearest) break;
      const { path: subPath, distance } = dijkstra(current, nearest);
      totalDistance += distance;
      path.push(...subPath.slice(1));
      visited.add(nearest);
      current = nearest;
    }

    if (!visited.has(to)) {
      const { path: finalPath, distance } = dijkstra(current, to);
      totalDistance += distance;
      path.push(...finalPath.slice(1));
    }

    return { path, distance: parseFloat(totalDistance.toFixed(3)) };
  }

  async optimizeSingle(dto: OptimizePathDto): Promise<ShortestPathResponseDto> {
    console.time('optimizeSingle');
    const result = this.optimize(dto);
    console.timeEnd('optimizeSingle');

    const dtoInstance = Object.assign(new ShortestPathResponseDto(), result);
    return dtoInstance;

  }

  async optimizeMulti(dto: OptimizeMultiDto) {
    console.log('Starting Benchmark...');

    // Concurrent
    console.time('Concurrent (Promise.all)');
    const concurrentResults = await Promise.all(
      dto.optimize.map(opt => this.optimizeSingle(opt))
    );
    console.timeEnd('Concurrent (Promise.all)');

    // Sequential
    console.time('Sequential Time')
    const sequentialResults: ShortestPathResponseDto[] = [];
    for (const opt of dto.optimize) {
      sequentialResults.push(await this.optimizeSingle(opt));
    }
    console.timeEnd('Sequential Time');
    const response = new ShortestMultiResponseDto()
    response.concurrentResults = concurrentResults;
    response.sequentialResults = sequentialResults;
    return response;
  }
}
