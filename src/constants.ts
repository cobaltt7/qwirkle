export const TILE_COLORS = ["red", "orange", "yellow", "green", "blue", "purple"]as const;
export const TILE_SHAPES = ["clover", "circle", "diamond", "square", "star", "triangle"]as const;
export function generateTileUrl({ color, shape }:{color:TileColor,shape:TileShape}) {
    return `./pieces/${color}-${shape}.png`;
}
