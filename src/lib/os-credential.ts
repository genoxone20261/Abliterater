export const OS_CRED_ERROR = {
  unavailable: "OS_CRED_UNAVAILABLE",
  localStorage: "OS_CRED_LOCALSTORAGE",
} as const;

/** Analog: OS credential store is not wired. Never fall back to localStorage/ZIP. */
export function storeOsCredential(_key: string, _value: string, backend = "none"): never {
  if (backend === "localStorage" || backend === "zip") throw new Error(OS_CRED_ERROR.localStorage);
  throw new Error(OS_CRED_ERROR.unavailable);
}

export function readOsCredential(_key: string): never {
  throw new Error(OS_CRED_ERROR.unavailable);
}
