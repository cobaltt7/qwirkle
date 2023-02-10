import { Vue } from "../lib/vue-class-component.js";
import type { Location, PlacedTile } from "../common/types.js";
import Component from "../lib/Component.js";
import type { App } from "../client.js";
import { generateTileUrl } from "../common/constants.js";

@Component()
export default class Game extends Vue {
	// Data
	boardSize: { rows: [number, number]; columns: [number, number] } = {
		rows: [0, 0],
		columns: [0, 0],
	};
	placedTiles: Record<Location["y"], Record<Location["x"], PlacedTile>> = {};
	selectedTile = -1;

	// Refs
	declare readonly $refs: {};
	declare readonly $root: App;

	// Hooks
	override mounted() {
		this.$root.socket.on("tilePlaced", (tile) => {
			if (tile.x < this.boardSize.columns[0]) this.boardSize.columns[0] = tile.x;
			else if (tile.x > this.boardSize.columns[1]) this.boardSize.columns[1] = tile.x;

			if (tile.y < this.boardSize.rows[0]) this.boardSize.rows[0] = tile.y;
			else if (tile.y > this.boardSize.rows[1]) this.boardSize.rows[1] = tile.y;

			(this.placedTiles[tile.y] ??= {})[tile.x] = tile;
		});
	}

	// Methods
	generateTileUrl = generateTileUrl;
	selectTile(event: Event) {
		if (!(event.target instanceof Element)) return; // Idk how this could happen but TS says it can
		const button = event.target.closest("button");
		if (!button) return; // Ignore, user didn't click on tile

		this.selectedTile = Array.prototype.indexOf.call(button.parentNode?.children ?? [], button);
	}
	parseRawIndexes(rawColumn: number, rawRow: number) {
		return {
			row: this.boardSize.rows[0] + rawRow - 2,
			column: this.boardSize.columns[0] + rawColumn - 2,
		};
	}
	tilePlaced(event: Event) {
		if (!(event.target instanceof HTMLDivElement && event.target.parentElement?.parentElement))
			return; // Ignore, user didn't click on tile

		if (this.selectedTile === -1) return; // Warn, user didn't select tile

		const { row, column } = this.parseRawIndexes(
			Array.prototype.indexOf.call(event.target.parentElement.children, event.target) + 1,
			Array.prototype.indexOf.call(
				event.target.parentElement.parentElement.children,
				event.target.parentElement,
			) + 1,
		);

		this.$root.socket.emit(
			"placeTile",
			{ y: row, x: column },
			this.selectedTile,
			(response) => {
				if (typeof response === "string") alert(response);
				else this.$root.heldTiles = response;
			},
		);
		this.selectedTile = -1;
	}
	getFromBoard(rawColumn: number, rawRow: number) {
		const locations = this.parseRawIndexes(rawColumn, rawRow);
		return this.placedTiles[locations.row]?.[locations.column];
	}
 }
