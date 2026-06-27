const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { validateBody } = require('../src/middleware/security');

test('Credential verification and JWT middlewares', async (t) => {
  await t.test('JWT signature checks verify correctly', () => {
    const payload = { id: 42, email: 'test@ayu.com' };
    const secret = 'ayu-rubiks-super-secure-jwt-secret-key';
    const token = jwt.sign(payload, secret);
    
    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, 42);
    assert.strictEqual(decoded.email, 'test@ayu.com');
  });

  await t.test('Body schematic validator rejects empty fields', () => {
    const keys = ['username', 'password'];
    const mockReq = { body: { username: 'Ayu' } }; // missing password
    let failedStatus = null;
    let failedJson = null;

    const mockRes = {
      status(code) {
        failedStatus = code;
        return this;
      },
      json(obj) {
        failedJson = obj;
      }
    };

    const mockNext = () => {};

    const validator = validateBody(keys);
    validator(mockReq, mockRes, mockNext);

    assert.strictEqual(failedStatus, 400);
    assert.match(failedJson.error, /Missing required fields: password/);
  });
});
