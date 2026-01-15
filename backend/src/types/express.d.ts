// Extensión de tipos para Express Request
declare namespace Express {
  export interface Request {
    tenantSlug?: string | null;
  }
}
