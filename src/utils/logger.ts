export const log = (...args: unknown[]): void => {
  if (process.env.DEBUG === 'true') {
    console.log('process.env.DEBUG', process.env.DEBUG);
    console.log(...args);
  } else {
    return;
  }
};
