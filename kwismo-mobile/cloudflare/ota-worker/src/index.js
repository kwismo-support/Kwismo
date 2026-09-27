export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const authHeader = request.headers.get('X-Cloudflare-OTA-Token');

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Cloudflare-OTA-Token',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'POST' && url.pathname === '/api/publish-manifest') {
      const secretToken = env.OTA_SECRET_TOKEN || 'kwismo-ota-secret-key-2026';
      if (authHeader !== secretToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json();
        const { branch, version, bundleUrl, assets, timestamp } = body;

        const key = `manifest:${branch || 'production'}`;
        const payload = JSON.stringify({
          version: version || '1.0.0',
          bundleUrl,
          assets: assets || [],
          publishedAt: timestamp || Date.now(),
        });

        if (env.OTA_KV) {
          await env.OTA_KV.put(key, payload);
        }

        return new Response(
          JSON.stringify({ success: true, branch, version, publishedAt: Date.now() }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (request.method === 'GET' && url.pathname.startsWith('/api/check-update')) {
      const branch = url.searchParams.get('branch') || 'production';
      const key = `manifest:${branch}`;

      let manifest = null;
      if (env.OTA_KV) {
        const raw = await env.OTA_KV.get(key);
        if (raw) manifest = JSON.parse(raw);
      }

      if (!manifest) {
        manifest = {
          version: '1.0.0',
          bundleUrl: `https://ota-assets.kwismo.com/bundles/${branch}/index.bundle`,
          assets: [],
          publishedAt: Date.now(),
        };
      }

      return new Response(JSON.stringify(manifest), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=10, s-maxage=10',
        },
      });
    }

    return new Response(JSON.stringify({ status: 'Kwismo Cloudflare OTA Worker Active', timestamp: Date.now() }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
