/**
 * Quick validation test for useSetupStore
 * Run with: npm run test or node test-setup-store.js
 */

import { useSetupStore } from './useSetupStore';
import { ShipType } from '@/types/game-enums';

console.log('🧪 Testing useSetupStore...\n');

// Get store instance
const store = useSetupStore.getState();

// Test 1: Initial State
console.log('✅ Test 1: Initial State');
console.log('   Ships count:', store.ships.length);
console.log('   All ships unplaced:', store.ships.every(s => s.startRow === -1));
console.log('   All ships placed:', store.allShipsPlaced()); // Should be false
console.log('');

// Test 2: Place a ship
console.log('✅ Test 2: Place Carrier at (0,0)');
const placed = store.placeShip(ShipType.CARRIER, 0, 0);
console.log('   Placement success:', placed);
console.log('   Carrier is placed:', store.isShipPlaced(ShipType.CARRIER));
const carrier = store.getShip(ShipType.CARRIER);
console.log('   Carrier position:', `(${carrier?.startRow}, ${carrier?.startCol})`);
console.log('');

// Test 3: Invalid placement (out of bounds)
console.log('✅ Test 3: Try placing Battleship out of bounds (0,9)');
const invalidPlaced = store.placeShip(ShipType.BATTLESHIP, 0, 9);
console.log('   Placement should fail:', !invalidPlaced);
console.log('');

// Test 4: Overlapping ships
console.log('✅ Test 4: Try placing Cruiser overlapping with Carrier (0,2)');
const overlapPlaced = store.placeShip(ShipType.CRUISER, 0, 2);
console.log('   Placement should fail:', !overlapPlaced);
console.log('');

// Test 5: Rotation
console.log('✅ Test 5: Rotate Carrier to vertical');
const rotated = store.rotateShip(ShipType.CARRIER);
console.log('   Rotation success:', rotated);
const rotatedCarrier = store.getShip(ShipType.CARRIER);
console.log('   New orientation:', rotatedCarrier?.orientation);
console.log('');

// Test 6: Random placement
console.log('✅ Test 6: Random board generation');
store.randomizeBoard();
console.log('   All ships placed:', store.allShipsPlaced());
console.log('   Ship positions:');
store.ships.forEach(ship => {
  console.log(`   - ${ship.type}: (${ship.startRow}, ${ship.startCol}) ${ship.orientation}`);
});
console.log('');

// Test 7: Reset board
console.log('✅ Test 7: Reset board');
store.resetBoard();
console.log('   All ships unplaced:', store.ships.every(s => s.startRow === -1));
console.log('');

console.log('🎉 All tests completed!\n');
