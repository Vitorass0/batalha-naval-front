// Hook customizado para lógica de validação do tabuleiro
import { GRID_SIZE } from '@/lib/constants';
import { Coordinate } from '@/types/game-enums';

export const useBoardLogic = () => {
  const isValidCoordinate = (coord: Coordinate): boolean => {
    return (
      coord.row >= 0 &&
      coord.row < GRID_SIZE &&
      coord.col >= 0 &&
      coord.col < GRID_SIZE
    );
  };

  const getAdjacentCells = (coord: Coordinate): Coordinate[] => {
    const adjacent: Coordinate[] = [];
    const directions = [
      { row: -1, col: 0 }, // cima
      { row: 1, col: 0 },  // baixo
      { row: 0, col: -1 }, // esquerda
      { row: 0, col: 1 },  // direita
    ];

    directions.forEach((dir) => {
      const newCoord = {
        row: coord.row + dir.row,
        col: coord.col + dir.col,
      };
      if (isValidCoordinate(newCoord)) {
        adjacent.push(newCoord);
      }
    });

    return adjacent;
  };

  const coordinateToString = (coord: Coordinate): string => {
    const letter = String.fromCharCode(65 + coord.col); // A, B, C...
    const number = coord.row + 1;
    return `${letter}${number}`;
  };

  const stringToCoordinate = (str: string): Coordinate | null => {
    const match = str.match(/^([A-J])(\d{1,2})$/i);
    if (!match) return null;

    const col = match[1].toUpperCase().charCodeAt(0) - 65;
    const row = parseInt(match[2], 10) - 1;

    if (isValidCoordinate({ row, col })) {
      return { row, col };
    }
    return null;
  };

  return {
    isValidCoordinate,
    getAdjacentCells,
    coordinateToString,
    stringToCoordinate,
  };
};
