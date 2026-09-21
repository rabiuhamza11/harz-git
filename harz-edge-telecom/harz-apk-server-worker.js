--2baab12536f94b17b42249efface0cc13d90a5fe4686da74d6281c96be1c
Content-Disposition: form-data; name="harz-apk-server.js"

// harz-apk-server.js
var harz_apk_server_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Content-Disposition": 'attachment; filename="HARZ-Edge-Telecom-v2.0.apk"',
      "Cache-Control": "no-cache"
    };
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(DOWNLOAD_PAGE, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }
      });
    }
    if (url.pathname === "/apk" || url.pathname === "/download") {
      if (env.HARZ_APK) {
        const data = await env.HARZ_APK.get("HARZ-Edge-Telecom-v2.0.apk", "arrayBuffer");
        if (data) {
          return new Response(data, {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/vnd.android.package-archive",
              "Content-Length": data.byteLength
            }
          });
        }
      }
      return new Response("APK not found in KV", { status: 404 });
    }
    return new Response("Not found", { status: 404 });
  }
};
var DOWNLOAD_PAGE = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f0f2f5">
<title>HARZ Edge Telecom \u2014 Download</title>
<style>
body { font-family: sans-serif; background: #f0f2f5; text-align: center; padding: 40px; margin: 0; }
h1 { color: #0a7d3c; }
.btn { display: inline-block; background: #0a7d3c; color: white; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-size: 18px; margin: 20px 0; }
.info { color: #666; font-size: 14px; max-width: 500px; margin: 20px auto; }
.feature { color: #333; font-size: 15px; max-width: 400px; margin: 5px auto; }
</style>
</head>
<body>
<h1>HARZ Edge Telecom v2.0</h1>
<p style="font-size:18px">Free phone-to-phone calling</p>
<p class="feature">No antenna needed</p>
<p class="feature">No cell tower needed</p>
<p class="feature">No internet needed</p>
<p class="feature">Phones connect directly via Wi-Fi Direct</p>
<p class="feature">All calls encrypted (ChaCha20)</p>
<a href="/apk" class="btn">Download APK (9.4 MB)</a>
<p class="info">Install on 2 Android phones (Android 8.0+). Grant Bluetooth + Location permissions when prompted. Open the app and start the mesh \u2014 phones will discover each other automatically.</p>
</body>
</html>`;
export {
  harz_apk_server_default as default
};
//# sourceMappingURL=harz-apk-server.js.map

--2baab12536f94b17b42249efface0cc13d90a5fe4686da74d6281c96be1c--
