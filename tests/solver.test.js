const test = require('node:test');
const assert = require('node:assert');
const { validateCubeState, solveCube } = require('../src/services/cubeSolver');

test('Solver Engine validation tests', async (t) => {
  await t.test('detects missing or invalid state structure', () => {
    const result = validateCubeState(null);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /missing/);
  });

  await t.test('detects incorrect sticker counts', () => {
    const badState = {
      U: Array(9).fill('white'),
      D: Array(9).fill('yellow'),
      F: Array(9).fill('red'),
      B: Array(9).fill('orange'),
      L: Array(9).fill('blue'),
      R: Array(9).fill('blue') // duplicate color count error
    };
    const result = validateCubeState(badState);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /Invalid color count/);
  });

  await t.test('accepts valid state configurations', () => {
    const goodState = {
      U: Array(9).fill('white'),
      D: Array(9).fill('yellow'),
      F: Array(9).fill('red'),
      B: Array(9).fill('orange'),
      L: Array(9).fill('blue'),
      R: Array(9).fill('green')
    };
    const result = validateCubeState(goodState);
    assert.strictEqual(result.valid, true);
  });
});

test('Solving optimal move compiles', () => {
  const goodState = {
    U: Array(9).fill('white'),
    D: Array(9).fill('yellow'),
    F: Array(9).fill('red'),
    B: Array(9).fill('orange'),
    L: Array(9).fill('blue'),
    R: Array(9).fill('green')
  };
  // Since it is solved initially, moves must compile to empty array or solved routines
  const result = solveCube(goodState);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.moves.length, 0);
});
