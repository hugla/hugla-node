const Hugla = require('../lib/hugla.js').default;

test('new Hugla() should throw an Error if appDir is not provided', () => {
  expect(() => {
    new Hugla();
  }).toThrow('appDir was not defined');
});
