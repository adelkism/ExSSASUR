const SESSION_COOKIE = 'exssasur_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  for (const part of cookieHeader.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (key === name) return valueParts.join('=');
  }
  return null;
}

function protectedHeaders(headers = new Headers()) {
  const result = new Headers(headers);
  result.set('Cache-Control', 'private, no-store');
  result.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  result.set('Referrer-Policy', 'no-referrer');
  result.set('X-Content-Type-Options', 'nosniff');
  result.set('X-Frame-Options', 'DENY');
  result.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return result;
}

function notFound() {
  return new Response('No encontrado', {
    status: 404,
    headers: protectedHeaders(new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })),
  });
}

async function sessionValue(accessToken) {
  return sha256(`exssasur-session:v1:${accessToken}`);
}

export default {
  async fetch(request, env) {
    if (!env.ACCESS_TOKEN) return new Response('Configuración incompleta', { status: 500 });

    const url = new URL(request.url);
    const expectedTokenHash = await sha256(env.ACCESS_TOKEN);
    const suppliedToken = url.searchParams.get('access');

    if (suppliedToken) {
      const suppliedTokenHash = await sha256(suppliedToken);
      if (!constantTimeEqual(suppliedTokenHash, expectedTokenHash)) return notFound();

      url.searchParams.delete('access');
      const cleanUrl = url.toString();
      const session = await sessionValue(env.ACCESS_TOKEN);
      const headers = protectedHeaders(new Headers({
        Location: cleanUrl,
        'Set-Cookie': `${SESSION_COOKIE}=${session}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`,
      }));
      return new Response(null, { status: 302, headers });
    }

    const expectedSession = await sessionValue(env.ACCESS_TOKEN);
    const actualSession = cookieValue(request, SESSION_COOKIE) ?? '';
    if (!constantTimeEqual(actualSession, expectedSession)) return notFound();

    const assetResponse = await env.ASSETS.fetch(request);
    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers: protectedHeaders(assetResponse.headers),
    });
  },
};
