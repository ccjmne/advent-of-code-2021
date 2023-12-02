import Graph from 'node-dijkstra'

import solution from 'src/solution-module'

export default solution({
  parse(data: string) {
    const map = data.split(/\n/g)

    return {
      map: data
        .replace(/S/, 'a')
        .replace(/E/, 'z')
        .split(/\n/g)
        .map(line => line.split('').map(char => 'abcdefghijklmnopqrstuvwxyz'.indexOf(char))),
      S: [map.findIndex(row => row.includes('S')), map.find(row => row.includes('S'))!.indexOf('S')],
      E: [map.findIndex(row => row.includes('E')), map.find(row => row.includes('E'))!.indexOf('E')],
    }
  },

  partI({ map, S: [rS, cS], E: [rE, cE] }): number {
    function getNeighbours(r: number, c: number, z: number): { [at: `${number},${number}`]: number } {
      return [[0, -1], [0, +1], [-1, 0], [+1, 0]].map(([Δr, Δc]) => [`${r + Δr},${c + Δc}`, map[r + Δr]?.[c + Δc]] as const)
        .filter(([, zz]) => zz <= z + 1)
        .reduce((acc, [at]) => ({ ...acc, [at]: 1 }), {})
    }

    const graph = new Graph()
    map.forEach((row, r) => row.forEach((z, c) => graph.addNode(`${r},${c}`, getNeighbours(r, c, z))))
    return (graph.path(`${rS},${cS}`, `${rE},${cE}`, { cost: true }) as { path: string[] }).path.length - 1
  },

  partII({ map, E: [rE, cE] }): number {
    function getNeighbours(r: number, c: number, z: number): { [at: `${number},${number}`]: number } {
      return [[0, -1], [0, +1], [-1, 0], [+1, 0]].map(([Δr, Δc]) => [`${r + Δr},${c + Δc}`, map[r + Δr]?.[c + Δc]] as const)
        .filter(([, zz]) => zz >= z - 1)
        .reduce((acc, [at, zz]) => ({ ...acc, [zz === 0 ? 'a' : at]: 1 }), {})
    }

    const graph = new Graph()
    map.forEach((row, r) => row.forEach((z, c) => graph.addNode(`${r},${c}`, getNeighbours(r, c, z))))
    return (graph.path(`${rE},${cE}`, 'a', { cost: true }) as { path: string[] }).path.length - 1
  },
})
