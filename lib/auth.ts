export function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const adminSecret = process.env.ADMIN_SECRET_TOKEN;
  
  if (!adminSecret) {
    console.warn('ADMIN_SECRET_TOKEN environment variable is not configured');
    return false;
  }
  return token === adminSecret;
}
