import request from 'sync-request';

// We're only importing the SERVER_URL from config.
// No functions that you've written should be imported,
// as all tests should be done through HTTP requests.
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

// We can write a test that sends a request directly
test('success direct', () => {
  const res = request(
    'GET',
    SERVER_URL + '/echo/echo',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      qs: {
        message: 'direct',
      }
    }
  );
  const data = JSON.parse(res.getBody() as string);
  expect(data).toStrictEqual({ message: 'direct' });
});

// And for an error case, we can check the status code:
test('success direct', () => {
  const res = request(
    'GET',
    SERVER_URL + '/echo/echo',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      qs: {
        message: 'echo',
      }
    }
  );
  expect(res.statusCode).toEqual(400);
});

// Similar to lab05_forum, you may decide to simply these requests by writing
// helper-wrapper functions :)
