import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { MovementLibrarySchema } from "./schema.js";
import type { MovementDefinition, MovementLibrary } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const movementsPath = join(__dirname, "data", "movements.json");
const movements = JSON.parse(readFileSync(movementsPath, "utf-8"));

const parsedMovements = MovementLibrarySchema.parse(movements);

const movementById: Record<string, MovementDefinition> = parsedMovements.reduce<Record<string, MovementDefinition>>(
  (acc, movement) => {
    acc[movement.id] = movement;
    return acc;
  },
  {}
);

export const movementLibrary: MovementLibrary = {
  movements: parsedMovements,
  byId: movementById,
};

export const listMovements = (): MovementDefinition[] => movementLibrary.movements;

export const getMovementById = (id: string): MovementDefinition | undefined => movementLibrary.byId[id];

export * from "./types.js";
export * from "./schema.js";

