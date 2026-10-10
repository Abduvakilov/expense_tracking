declare module "cloudflare:workers" {
  export interface D1Result<T = Record<string, unknown>> {
    results: T[];
  }

  export interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
    run(): Promise<unknown>;
  }

  export interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  export const env: {
    TELEGRAM_BOT_TOKEN?: string;
    DB?: D1Database;
  };
}
