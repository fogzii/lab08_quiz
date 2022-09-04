/**
 * This file contains the logic of the route `/echo/echo`
 * @module echo
 */
import HTTPError from 'http-errors';

export function echo(message: string) {
  if (message === 'echo') {
    // This is a new way of indicating Exceptions - our
    // COMP1531 middleware in server.ts will catch this.
    throw HTTPError(400, "Cannot echo 'echo'!");
  }
  return {
    message,
  };
}
