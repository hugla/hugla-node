const Hugla = require('./../lib/hugla.js');

test('new Hugla() should throw an Error if appDir is not provided', () => {
  expect(() => {
    new Hugla();
  }).toThrow(Error);
});
