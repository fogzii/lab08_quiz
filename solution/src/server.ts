import express, { json, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from 'middleware-http-errors';

// Importing the example implementation for echo in echo.js
import { echo } from './echo';
import { port, url } from './config.json';

import {
  clear,
  questionAdd,
  questionEdit,
  questionRemove,
  quizCreate,
  quizDetails,
  quizEdit,
  quizRemove,
  quizzesList,
} from './quiz';

const PORT: number = parseInt(process.env.PORT || port);

const app = express();

// Use middleware that allows for access from other domains
app.use(cors());
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// (OPTIONAL) Use middleware to log (print to terminal) incoming HTTP requests
app.use(morgan('dev'));

// Root URL
app.get('/', (req: Request, res: Response) => {
  console.log('Print to terminal: someone accessed our root url!');
  res.json(
    {
      message: "Welcome to Lab08 Quiz Server's root URL!",
    }
  );
});

app.get('/echo/echo', (req: Request, res: Response) => {
  // For GET request, parameters are passed in a query string.
  // You will need to typecast for GET requests.
  const message = req.query.message as string;

  // Logic of the echo function is abstracted away in a different
  // file called echo.py.
  res.json(echo(message));
});

app.post('/quiz/create', (req: Request, res: Response) => {
  const { quizTitle, quizSynopsis } = req.body;
  res.json(quizCreate(quizTitle, quizSynopsis));
});

app.get('/quiz/details', (req: Request, res: Response) => {
  const quizId = parseInt(req.query.quizId as string);
  res.json(quizDetails(quizId));
});

app.put('/quiz/edit', (req: Request, res: Response) => {
  const { quizId, quizTitle, quizSynopsis } = req.body;
  res.json(quizEdit(quizId, quizTitle, quizSynopsis));
});

app.delete('/quiz/remove', (req: Request, res: Response) => {
  const quizId = parseInt(req.query.quizId as string);
  res.json(quizRemove(quizId));
});

app.get('/quizzes/list', (req: Request, res: Response) => {
  res.json(quizzesList());
});

app.post('/question/add', (req: Request, res: Response) => {
  const { quizId, questionString, questionType, answers } = req.body;
  res.json(questionAdd(quizId, questionString, questionType, answers));
});

app.put('/question/edit', (req: Request, res: Response) => {
  const { questionId, questionString, questionType, answers } = req.body;
  res.json(questionEdit(questionId, questionString, questionType, answers));
});

app.delete('/question/remove', (req: Request, res: Response) => {
  const questionId = parseInt(req.query.questionId as string);
  res.json(questionRemove(questionId));
});

app.delete('/clear', (req: Request, res: Response) => {
  res.json(clear());
});

/**
 * Using COMP1531's error handling middleware. This must be declared
 * after your routes!
 */
app.use(errorHandler());

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log(`Started server at URL: '${url}:${PORT}'`);
});

/**
 * For coverage, handle Ctrl+C gracefully
 */
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
