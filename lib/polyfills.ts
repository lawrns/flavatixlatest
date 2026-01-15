// Polyfills for server-side rendering
// Fix "self is not defined" error when using browser libraries on the server

if (typeof self === 'undefined') {
  // @ts-ignore
  global.self = global;
}
