# Lab08 - Quiz

[TOC]

## Due Date

Week 9 Monday 5:00 pm [Sydney Local Time](https://www.timeanddate.com/worldclock/australia/sydney)

## Background

### Rationale

Now that we've learned how to use `jest --coverage` ...
- **Question**: is it possible to measure the code of our express server this way?
- **Answer**: No, no, no (we don't talk about Bruno ~).

Unfortunately, our test with jest, which utilises [sync-request](https://www.npmjs.com/package/sync-request), is only making HTTP requests to a server at a certain URL address. Visually, this looks like

<div align="center">

```
+----------------+                               +----------------+
|                |   >>>>  HTTP Requests  >>>>   |                |
|   Jest tests   |                               | Express server |
|                |   <<<<  HTTP Response  <<<<   |                |
+----------------+                               +----------------+
```

</div>

This means that Jest does not know about the implementation of our server (only what comes in and out) and thus cannot measure coverage directly.

So... how can we measure the code coverage of our server? You guessed it, it's by directly measuring coverage when running the server itself - we can do this with a nifty tool called [nyc](https://www.npmjs.com/package/nyc)!

In addition to measuring our server code coverage, we will also be throwing HTTPErrors and utilising COMP1531's custom middleware for error handling in this lab. Many questions, and many more answers to come!

### Getting Started
- Please ensure that you have completed lab08_objection prior.
- Copy the SSH clone link from Gitlab and clone this repository on either VLAB or your local machine. 
- In your terminal, change your directory (using the `cd` command) into the newly cloned lab.

### Package Installation

1. Open [package.json](package.json) and look at existing packages in `"dependencies"` and `"devDependencies"`. Install them with:
    ```shell
    $ npm install
    ```

1. Install [http-errors](https://www.npmjs.com/package/http-errors) and COMP1531's custom [middleware-http-errors](https://www.npmjs.com/package/middleware-http-errors):
    ```shell
    $ npm install http-errors middleware-http-errors
    ```

1. Install [nyc](https://www.npmjs.com/package/nyc) and the type definitions [@types/http-errors](https://www.npmjs.com/package/@types/http-errors) as development dependencies:
    ```shell
    $ npm install --save-dev nyc @types/http-errors
    ```

1. Open your [package.json](package.json) and add the following scripts:
    ```json
    "scripts": {
        "ts-node": "ts-node",
        "ts-node-coverage": "nyc --reporter=text --reporter=lcov ts-node",
        "test": "jest",
        "posttest":  "pkill -f 'node_modules/sync-rpc/lib/worker.js' > /dev/null 2>&1",
        "tsc": "tsc --noEmit",
        "lint": "eslint src/**.ts"
        // Any other scripts you want here
    }
    ```

1. Notice in the `ts-node-coverage` script we have added `nyc --reporter=text --reporter=lcov` before running `ts-node`:
    - `nyc` - to measure our server code coverage.
    - `--reporter=text` - display coverage results to the terminal when the server closes.
    - `--reporter=lcov` - also generates a `coverage/lcov-report/index.html` file for us to open in our browser.
    - Further instructions on server coverage can be found in the [Testing](#testing) section.

1. To check that you have completed the steps correctly, compare your [package.json](package.json) with our sample package.json in the [Additional Information](#additional-information) section.

1. Use `git` to `add`, `commit` and `push` your [package.json](package.json) and [package-lock.json](package-lock.json).

1. (Optional) Update [.gitlab-ci.yml](.gitlab-ci.yml) with testing and linting.

1. (Optional) Bonus Tips: you may find the following scripts helpful:
    ```json
    "start": "ts-node src/server.ts",
    "start-dev": "ts-node-dev src/server.ts",
    "coverage-start": "nyc --reporter=text --reporter=lcov ts-node src/server.ts",
    "coverage-start-dev": "nyc --reporter=text --reporter=lcov ts-node-dev src/server.ts",
    ```

### Interface: Routes

<table>
  <tr>
    <th>Name & Description</th>
    <th>HTTP Method</th>
    <th>Data Types</th>
    <th>Errors</th>
  </tr>
  <tr>
    <td>
        <code>/</code><br /><br />
        This is an example route that we will implement for you.
        <br/><br/>
        Display a message when the root URL of the server is accessed directly.
        <br/><br/><b>Difficulty</b>: N/A
    </td>
    <td>
        GET
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{message}</code>
    </td>
    <td>
        N/A
    </td>
  </tr>
  <tr>
    <td>
        <code>/echo/echo</code><br/><br/>
        This is an example route that we will implement for you.
        <br/><br/>
        Echoes the given message back to the caller.
        <br/><br/><b>Difficulty</b>: N/A
    </td>
    <td>
        GET
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{message}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{message}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when the message passed in is exactly <code>echo</code>.
    </td>
  </tr>
  <tr>
    <td>
        <code>/quiz/create</code><br/><br/>
        Create a quiz and return its corresponding id.
        <br/><br/><b>Difficulty</b>: ⭐
    </td>
    <td>
        POST
    </td>
    <td>
        <b>Body Parameters</b><br/>
        <code>{quizTitle, quizSynopsis}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{quizId}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizTitle is an empty string, <code>""</code></li>
            <li>quizSynopsis is an empty string <code>""</code></li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/quiz/details</code><br/><br/>
        Get the full details about a quiz
        <br/><br/><b>Difficulty</b>: ⭐⭐
    </td>
    <td>
        GET
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{quizId}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{quiz}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/quiz/edit</code><br /><br />
        Edit a quiz
        <br/><br/><b>Difficulty</b>: ⭐
    </td>
    <td>
        PUT
    </td>
    <td>
        <b>Body Parameters</b><br/>
        <code>{quizId, quizTitle, quizSynopsis}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
            <li>quizTitle is an empty string, <code>""</code></li>
            <li>quizSynopsis is an empty string <code>""</code></li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/quiz/remove</code><br/><br/>
        Remove a quiz
        <br/><br/><b>Difficulty</b>: ⭐
    </td>
    <td>
        DELETE
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{quizId}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/quizzes/list</code><br/><br/>
        Get brief details about all quizzes, in the order that they were created.
        <br/><br/>
        For example, if we create <code>q1</code>, <code>q2</code> and <code>q3</code>, the returned order is
        <code>[q1, q2, q3]</code>.
        <br/><br/><b>Difficulty</b>: ⭐
    </td>
    <td>
        GET
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{quizzes}</code>
    </td>
    <td>
        N/A
    </td>
  </tr>
  <tr>
    <td>
        <code>/question/add</code><br/><br/>
        Add a question to a quiz
        <br/><br/><b>Difficulty</b>: ⭐⭐
    </td>
    <td>
        POST
    </td>
    <td>
        <b>Body Parameters</b><br/>
        <code>{quizId, questionString, questionType, answers}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{questionId}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>quizId does not refer to a valid quiz
            <li>questionString is an empty string <code>""</code></li>
            <li>questionType is not either "single" or "multiple"
            <li>the questionType is "single" and there is not exactly 1 correct answer</li>
            <li>there are no correct answers</li>
            <li>any of the <code>answerString</code> is an empty string, <code>""</code></li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/question/edit</code><br/><br/>
        Edits a question
        <br/><br/><b>Difficulty</b>: ⭐⭐
    </td>
    <td>
        PUT
    </td>
    <td>
        <b>Body Parameters</b><br/>
        <code>{questionId, questionString, questionType, answers}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>questionId does not refer to a valid question
            <li>questionString is an empty string <code>""</code></li>
            <li>questionType is not either "single" or "multiple"
            <li>the questionType is "single" and there is not exactly 1 correct answer</li>
            <li>there are no correct answers</li>
            <li>any of the <code>answerString</code> is an empty string, <code>""</code></li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/question/remove</code><br/><br/>
        Remove a question
        <br/><br/><b>Difficulty</b>: ⭐
    </td>
    <td>
        DELETE
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{questionId}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        Throw <code>HTTPError</code> (code <code>400</code>) when
        <ul>
            <li>questionId does not refer to a valid question
        </ul>
    </td>
  </tr>
  <tr>
    <td>
        <code>/clear</code><br/><br/>
        Clear all data.
        <br/><br/><b>Difficulty</b>: ⭐
    </td>
    <td>
        DELETE
    </td>
    <td>
        <b>Query Parameters</b><br/>
        <code>{}</code>
        <br/><br/>
        <b>Return Object</b><br/>
        <code>{}</code>
    </td>
    <td>
        N/A
    </td>
  </tr>
</table>

#### Notes:

1. The `answers` for each question, when returned, should be in the same order they were given.
1. IDs should always be unique. When a quiz or question is deleted, their IDs should not be re-used.
1. For arrays of objects, they should be returned in the order the objects were created, similar to the example given in `/quizzes/list`.

### Interface: Data Types

| Variable Name | Type |
| --- | --- |
| contains prefix **is** | `boolean` |
| contains suffix **Id** | `number` |
| contains suffix **String** | `string` |
| is exactly **message** | `string` |
| is exactly **quizTitle** | `string` |
| is exactly **quizSynopsis** | `string` |
| is exactly **questionType** | `string` - reminder: valid types are 'single' and 'multiple' |
| is exactly **answers** | `Array` of objects, where each `object` contains keys `{isCorrect, answerString}` |
| is exactly **questions** | `Array` of objects, where each `object` contains keys `{questionId, questionString, questionType, answers}` |
| is exactly **quiz** | Object containing keys `{quizId, quizTitle, quizSynopsis, questions}` |
| is exactly **quizzes** | `Array` of objects, where each `object` contains the keys `{quizId, quizTitle}` |

## Task

### Testing

A test suite for this lab has been provided to you in [src/quiz.test.ts](src/quiz.test.ts). Writing additional tests for this lab is optional.

To test your code and *view the coverage results*:

<table>
    <tr>
        <th><b>Terminal 1 - Server</b></th>
        <th><b>Terminal 2 - Test</b></th>
    </tr>
    <tr>
        <td>
            Step 1: <code>$ npm run ts-node-coverage src/server.ts</code>
            <br/><br/>
        </td>
        <td>
        </td>
    </tr>
    <tr>
        <td>
        </td>
        <td>
            Step 2: <code>$ npm test</code>
        </td>
    </tr>
    <tr>
        <td>
            Step 3: <code>Ctrl+C</code> to close the server. Brief coverage details should be displayed.
        </td>
        <td>
        </td>
    </tr>
    <tr>
        <td>
            Step 4: Open <code>coverage/lcov-report/index.html</code> in a browser (e.g. Firefox/Google Chrome)
        </td>
        <td>
        </td>
    </tr>
</table>

#### TIP
- Step 4 only needs to be done once, you can refresh the `index.html` page after repeating steps 1-3 to get updated results.

### Implementation

In this lab, we recommend keeping your routes in [src/server.ts](src/server.ts) as wrappers around other functions.

You are expected to achieve 100% coverage for this lab. If this is not the case with the provided test suite, you can either modify your implementation or write additional tests to target the uncovered lines in your code.

### Frontend

A prototype frontend for the forum application is hosted at:
- https://comp1531frontend.gitlab.io/quiz/home

To use the frontend, simply paste your backend URL (e.g. http://127.0.0.1:49152) into the input box.

While additional error checking has been built into the frontend, it is not uncommon to encounter a blank/white screen. This is usually attributed to having an incorrect return type in one of the routes from your backend, most commonly from `GET` requests such as `quiz/details` or `quizzes/list`.

## Submission

- Use `git` to `add`, `commit`, and `push` your changes on your master branch.
- Check that your code has been uploaded to your Gitlab repository on this website (you may need to refresh the page).

**If you have pushed your latest changes to master on Gitlab no further action is required! At the due date and time, we automatically collect your work from what's on your master branch on Gitlab.**

## Additional Information

### Sample package.json

<details>

<summary>Click to view our sample package.json</summary><br/>

**Note**: 
1. The main keys to pay attention to are `"scripts"`, `"dependencies"` and `"devDependencies"`.
1. It is fine if the versions of your packages are newer.

```json
{
  "name": "lab08_quiz",
  "version": "1.0.0",
  "description": "[TOC]",
  "main": "src/server.ts",
  "scripts": {
    "ts-node": "ts-node",
    "ts-node-coverage": "nyc --reporter=text --reporter=lcov ts-node",
    "test": "jest",
    "posttest":  "pkill -f 'node_modules/sync-rpc/lib/worker.js' > /dev/null 2>&1",
    "tsc": "tsc --noEmit",
    "lint": "eslint src/**.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/cors": "^2.8.12",
    "@types/express": "^4.17.13",
    "@types/http-errors": "^1.8.2",
    "@types/jest": "^27.5.1",
    "@types/morgan": "^1.9.3",
    "@typescript-eslint/eslint-plugin": "^5.23.0",
    "@typescript-eslint/parser": "^5.23.0",
    "eslint": "^8.15.0",
    "eslint-plugin-jest": "^26.2.1",
    "jest": "^28.1.0",
    "nyc": "^15.1.0",
    "sync-request": "^6.1.0",
    "ts-jest": "^28.0.2",
    "ts-node": "^10.7.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^4.6.4"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.1",
    "http-errors": "^2.0.0",
    "middleware-http-errors": "^0.1.0",
    "morgan": "^1.10.0"
  }
}
```

</details>
