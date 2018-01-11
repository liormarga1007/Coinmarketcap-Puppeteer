let value = 0

module.exports = {
  increment: () => value++,
  decrement: () => value--,
  get: () => value,
}