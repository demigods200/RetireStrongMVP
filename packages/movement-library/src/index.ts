import movements from "./data/movements.json";
import { MovementLibrarySchema } from "./schema.js";
import type { MovementDefinition, MovementLibrary } from "./types.js";

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
