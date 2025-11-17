export class TokenMemoryStore {
  private token: string | null = null;

  set(token: string): void {
    this.token = token;
  }

  get(): string | null {
    return this.token;
  }

  clear(): void {
    this.token = null;
  }
}

