// Everything happens in the browser (ADR 0008), so the whole app is built once
// as static files and never asks a server for anything.
export const prerender = true;
export const ssr = false;
