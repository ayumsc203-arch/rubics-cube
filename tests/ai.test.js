const test = require('node:test');
const assert = require('node:assert');
const { askCoach } = require('../src/services/aiService');

test('AI generative assistant service', async (t) => {
  await t.test('Gemini integration returns localized answers if offline or keys missing', async () => {
    const profile = { lvl: 12, xp: 280, streak: 5 };
    const recentSolves = [{ time: 19.58 }, { time: 24.15 }];
    const answer = await askCoach('f2l insertion questions', profile, recentSolves);
    
    assert.ok(answer.length > 10);
    assert.match(answer, /F2L/);
  });
});
