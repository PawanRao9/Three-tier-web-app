require('dotenv').config();

// Mock mongoose BEFORE anything else that might require it
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return actual;
});

// Clean up after all tests
afterAll(() => {
  // Allow async operations to complete
  return new Promise((resolve) => setTimeout(resolve, 100));
});
