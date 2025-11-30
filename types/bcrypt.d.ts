declare module "bcrypt" {
  function hash(data: string, saltOrRounds: number): Promise<string>;
  function compare(data: string, encrypted: string): Promise<boolean>;
  export { hash, compare };
  export default { hash, compare };
}
