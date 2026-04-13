declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// This empty export is required to make TypeScript treat this file as a module
export {};
