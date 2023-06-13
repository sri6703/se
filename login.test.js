const request = require('supertest');
const { app, startServer } = require('./server'); // Import the app and startServer function

let server; // Declare a variable to hold the server instance

beforeAll(async () => {
  server = startServer(); // Start the server before running the tests
});

afterAll(async () => {
  server.close(); // Close the server after running the tests
});

describe('GET /addtocart/:id', () => {
  it('should return the cart item with the given id', async () => {
    const id = '150';
    const res = await request(app).get(`/addtocart/${id}`);
    expect(res.statusCode).toBe(200);
    // Add assertions to check the response body
  });
});

describe('GET /admin-login-page/:email', () => {
  it('should return the admin details with the given email', async () => {
    const email = 'pri@gmail.com';
    const res = await request(app).get(`/admin-login-page/${email}`);
    expect(res.statusCode).toBe(200);
    // Add assertions to check the response body
  });
});
// Add more test cases for the remaining routes...
