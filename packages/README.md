## User Hobbies Application

Project is set up as a monorepo, with client and server packages.

## Prerequisites

- Yarn
- Node: at least LTS version 16
- MongoDB: Exposed on port `27017`

## Building

- From the root of the project install dependencies.

```bash
yarn
```

- Still from the root run build.

```bash
yarn build
```

## Running

- Make sure you built the project

- From the root of the project directory, run the following, which should start the client application on port `3000` and server on port `5000`:

```bash
yarn start
```

- Open the browser and visit `http://localhost:3000` to access the client application.

- You can also visit `http://localhost:5000/docs` to access swagger documentation for the server.

## Testing

- From the root of the project directory, run tests

```bash
yarn test
```
