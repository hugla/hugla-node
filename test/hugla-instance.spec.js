const Hugla = require('../lib/hugla.js').default;

test('should call #shutdown if error event occurs', () => {
  const hugla = new Hugla(__dirname);
  hugla.shutdown = jest.fn();
  hugla.emit('error', new Error('test'));
  expect(hugla.shutdown.mock.calls.length).toBe(1);
});
