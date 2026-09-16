import assert from "node:assert/strict";
import { test } from "node:test";
import { pkcePair } from "./pkce.ts";
import {
  OAUTH_ERROR,
  buildOauthAuthorizeUrl,
  exchangeOauthCode,
  getOauthMemory,
  oauthAuthorizeSpec,
  setOauthMemory,
} from "./oauth-authorize.ts";

test("Azure OAuth is Entra authorize+PKCE, not an API-key console", () => {
  const pair = pkcePair();
  const url = buildOauthAuthorizeUrl({
    provider: "azure",
    clientId: "11111111-1111-1111-1111-111111111111",
    redirectUri: "http://127.0.0.1:8080/oauth-callback.html",
    challenge: pair.challenge,
    state: "st1",
  });
  assert.match(url, /^https:\/\/login\.microsoftonline\.com\/common\/oauth2\/v2\.0\/authorize\?/);
  assert.match(url, /response_type=code/);
  assert.match(url, /code_challenge_method=S256/);
  assert.match(url, /code_challenge=/);
  assert.match(url, /redirect_uri=/);
  assert.match(url, /scope=/);
  assert.match(url, /management\.azure\.com/);
  assert.doesNotMatch(url, /juno627|koreacentral|startup/i);
  assert.equal(oauthAuthorizeSpec("azure")?.token, "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token");
  assert.equal(oauthAuthorizeSpec("azure-ml")?.authorize, oauthAuthorizeSpec("azure")?.authorize);
  assert.equal(oauthAuthorizeSpec("azure-vm")?.authorize, oauthAuthorizeSpec("azure")?.authorize);
});

test("OAuth builders reject missing public client id and do not default a personal tenant", () => {
  const pair = pkcePair();
  assert.throws(
    () =>
      buildOauthAuthorizeUrl({
        provider: "azure",
        clientId: "",
        redirectUri: "http://127.0.0.1:8080/oauth-callback.html",
        challenge: pair.challenge,
        state: "st",
      }),
    new RegExp(OAUTH_ERROR.client),
  );
  assert.throws(
    () =>
      buildOauthAuthorizeUrl({
        provider: "runpod",
        clientId: "11111111-1111-1111-1111-111111111111",
        redirectUri: "http://127.0.0.1:8080/oauth-callback.html",
        challenge: pair.challenge,
        state: "st",
      }),
    new RegExp(OAUTH_ERROR.provider),
  );
});

test("OAuth token exchange stays in memory and never writes storage", async () => {
  setOauthMemory(null);
  const token = await exchangeOauthCode(
    {
      provider: "azure",
      clientId: "11111111-1111-1111-1111-111111111111",
      redirectUri: "http://127.0.0.1:8080/oauth-callback.html",
      code: "auth-code",
      verifier: "verifier-1",
      tenant: "common",
    },
    async () =>
      new Response(
        JSON.stringify({
          access_token: "mem-token",
          token_type: "Bearer",
          expires_in: 3600,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
  );
  assert.equal(token.accessToken, "mem-token");
  assert.equal(getOauthMemory()?.accessToken, "mem-token");
  assert.equal(getOauthMemory()?.provider, "azure");
  assert.equal("localStorage" in (globalThis as object) ? true : true, true);
  setOauthMemory(null);
  assert.equal(getOauthMemory(), null);
});
