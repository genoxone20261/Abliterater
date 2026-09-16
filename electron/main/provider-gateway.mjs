export const READ_TARGETS = {
  runpod: {
    list: "https://rest.runpod.io/v1/pods",
    read: "https://rest.runpod.io/v1/pods/{id}",
    auth: "bearer",
  },
  lambda: {
    list: "https://cloud.lambda.ai/api/v1/instances",
    read: "https://cloud.lambda.ai/api/v1/instances/{id}",
    auth: "bearer",
  },
  vast: {
    list: "https://console.vast.ai/api/v0/instances/",
    read: "https://console.vast.ai/api/v0/instances/{id}",
    auth: "bearer",
  },
  shadeform: {
    list: "https://api.shadeform.ai/v1/instances",
    read: "https://api.shadeform.ai/v1/instances/{id}/info",
    auth: "x-api-key",
  },
  "massed-compute": {
    list: "https://vm.massedcompute.com/api/v1/instance",
    read: "https://vm.massedcompute.com/api/v1/instance/{id}",
    auth: "bearer",
  },
  "thunder-compute": {
    list: "https://api.thundercompute.com:8443/v1/instances/list",
    read: "",
    auth: "bearer",
  },
  "prime-intellect": {
    list: "https://api.primeintellect.ai/api/v1/pods/",
    read: "https://api.primeintellect.ai/api/v1/pods/{id}",
    auth: "bearer",
  },
  "deep-infra-gpu": {
    list: "https://api.deepinfra.com/v1/containers",
    read: "https://api.deepinfra.com/v1/containers/{id}",
    auth: "bearer",
  },
  digitalocean_gpu: {
    list: "https://api.digitalocean.com/v2/droplets",
    read: "https://api.digitalocean.com/v2/droplets/{id}",
    auth: "bearer",
  },
  "together-compute": {
    list: "https://api.together.ai/v1/compute/clusters",
    read: "https://api.together.ai/v1/compute/clusters/{id}",
    auth: "bearer",
  },
};

const ALIASES = { vastai: "vast", "digitalocean-gpu": "digitalocean_gpu" };

function canonicalProvider(id) {
  if (typeof id !== "string") return id;
  if (Object.hasOwn(READ_TARGETS, id)) return id;
  const alias = ALIASES[id];
  if (alias && Object.hasOwn(READ_TARGETS, alias)) return alias;
  const swapped = id.includes("_") ? id.replaceAll("_", "-") : id.replaceAll("-", "_");
  if (Object.hasOwn(READ_TARGETS, swapped)) return swapped;
  return id;
}

export const GATEWAY_ERROR = {
  request: "GATEWAY_REQUEST",
  provider: "GATEWAY_PROVIDER",
  token: "GATEWAY_TOKEN",
  id: "GATEWAY_ID",
  http: "GATEWAY_HTTP",
  empty: "GATEWAY_EMPTY",
  size: "GATEWAY_SIZE",
  network: "GATEWAY_NETWORK",
};

function readUrl(spec, id) {
  if (!id) return spec.list;
  if (!spec.read) throw new Error(GATEWAY_ERROR.provider);
  return spec.read.replaceAll("{id}", encodeURIComponent(id));
}

function requestHeaders(auth, token) {
  if (auth === "x-api-key") return { Accept: "application/json", "X-API-KEY": token };
  return { Accept: "application/json", Authorization: `Bearer ${token}` };
}

/** Main-process only: bounded read requests, never arbitrary URLs or mutations. */
export async function providerRead(request, fetcher = fetch) {
  if (
    !request ||
    typeof request !== "object" ||
    Array.isArray(request) ||
    Object.keys(request).some((k) => !["provider", "token", "id"].includes(k))
  )
    throw new Error(GATEWAY_ERROR.request);
  const { provider, token, id } = request;
  const name = canonicalProvider(provider);
  if (typeof provider !== "string" || !Object.hasOwn(READ_TARGETS, name))
    throw new Error(GATEWAY_ERROR.provider);
  if (typeof token !== "string" || !token.trim() || token.length > 4096 || /[\r\n]/.test(token))
    throw new Error(GATEWAY_ERROR.token);
  if (id !== undefined && (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,256}$/.test(id)))
    throw new Error(GATEWAY_ERROR.id);
  const spec = READ_TARGETS[name];
  try {
    const response = await fetcher(readUrl(spec, id), {
      method: "GET",
      headers: requestHeaders(spec.auth, token),
      signal: AbortSignal.timeout(15000),
      redirect: "error",
      credentials: "omit",
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`${GATEWAY_ERROR.http} ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error(GATEWAY_ERROR.empty);
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2_000_000) throw new Error(GATEWAY_ERROR.size);
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
      reader.releaseLock();
    }
    const data = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return JSON.parse(new TextDecoder().decode(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      new RegExp(`^${GATEWAY_ERROR.http} \\d{3}$`).test(message) ||
      message === GATEWAY_ERROR.size
    )
      throw new Error(message);
    if (message === GATEWAY_ERROR.provider || message === GATEWAY_ERROR.empty)
      throw new Error(message);
    throw new Error(GATEWAY_ERROR.network);
  }
}

const MUTATE_TARGETS = {
  runpod: [
    {
      method: "POST",
      template: "https://rest.runpod.io/v1/pods",
      keys: [
        "name",
        "imageName",
        "gpuTypeIds",
        "gpuCount",
        "cloudType",
        "volumeInGb",
        "containerDiskInGb",
      ],
    },
    { method: "POST", template: "https://rest.runpod.io/v1/pods/{id}/stop", keys: [] },
    { method: "DELETE", template: "https://rest.runpod.io/v1/pods/{id}", keys: [] },
  ],
  lambda: [
    {
      method: "POST",
      template: "https://cloud.lambda.ai/api/v1/instance-operations/launch",
      keys: ["region_name", "instance_type_name", "ssh_key_names", "name", "image"],
    },
    {
      method: "POST",
      template: "https://cloud.lambda.ai/api/v1/instance-operations/terminate",
      keys: ["instance_ids"],
    },
  ],
  vast: [
    {
      method: "PUT",
      template: "https://console.vast.ai/api/v0/asks/{id}/",
      keys: ["image", "disk", "label", "client_id"],
    },
    { method: "DELETE", template: "https://console.vast.ai/api/v0/instances/{id}/", keys: [] },
  ],
};

function templateMatches(template, url) {
  const escaped = template
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace("\\{id\\}", "[A-Za-z0-9_-]{1,256}");
  return new RegExp(`^${escaped}$`).test(url);
}

/** Main-process mutations: allowlisted URLs only, never arbitrary fetch. */
export async function providerMutate(request, fetcher = fetch) {
  if (
    !request ||
    typeof request !== "object" ||
    Array.isArray(request) ||
    Object.keys(request).some(
      (k) => !["provider", "token", "method", "url", "body", "requestId"].includes(k),
    )
  )
    throw new Error(GATEWAY_ERROR.request);
  const { provider, token, method, url, body, requestId } = request;
  const name = canonicalProvider(provider);
  if (typeof provider !== "string" || !Object.hasOwn(MUTATE_TARGETS, name))
    throw new Error(GATEWAY_ERROR.provider);
  if (typeof token !== "string" || !token.trim() || token.length > 4096 || /[\r\n]/.test(token))
    throw new Error(GATEWAY_ERROR.token);
  if (typeof method !== "string" || !["POST", "PUT", "DELETE"].includes(method))
    throw new Error(GATEWAY_ERROR.request);
  if (typeof url !== "string" || url.length > 512) throw new Error(GATEWAY_ERROR.request);
  const spec = (MUTATE_TARGETS[name] || []).find(
    (row) => row.method === method && templateMatches(row.template, url),
  );
  if (!spec) throw new Error(GATEWAY_ERROR.provider);
  let parsed = {};
  if (body) {
    if (typeof body !== "string" || body.length > 16_384) throw new Error(GATEWAY_ERROR.size);
    try {
      parsed = JSON.parse(body);
    } catch {
      throw new Error(GATEWAY_ERROR.request);
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error(GATEWAY_ERROR.request);
    if (Object.keys(parsed).some((key) => !spec.keys.includes(key)))
      throw new Error(GATEWAY_ERROR.request);
  } else if (spec.keys.length) {
    throw new Error(GATEWAY_ERROR.request);
  }
  if (
    requestId !== undefined &&
    (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(requestId))
  ) {
    throw new Error(GATEWAY_ERROR.request);
  }
  const auth = READ_TARGETS[name]?.auth ?? "bearer";
  try {
    const headers = {
      ...requestHeaders(auth, token),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(requestId ? { "Idempotency-Key": requestId } : {}),
    };
    const response = await fetcher(url, {
      method,
      headers,
      body: body || undefined,
      signal: AbortSignal.timeout(15000),
      redirect: "error",
      credentials: "omit",
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`${GATEWAY_ERROR.http} ${response.status}`);
    }
    const text = await response.text();
    if (text.length > 2_000_000) throw new Error(GATEWAY_ERROR.size);
    return text ? JSON.parse(text) : {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      new RegExp(`^${GATEWAY_ERROR.http} \\d{3}$`).test(message) ||
      message === GATEWAY_ERROR.size
    )
      throw new Error(message);
    throw new Error(GATEWAY_ERROR.network);
  }
}
