declare module "node:path" {
  const path: any;
  export default path;
}

declare module "node:fs/promises" {
  export const mkdir: any;
  export const readFile: any;
  export const writeFile: any;
}

declare module "node:readline" {
  const readline: any;
  export default readline;
}

declare const process: any;
