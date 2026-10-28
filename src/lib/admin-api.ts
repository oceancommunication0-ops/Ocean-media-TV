import { API_BASE_URL } from "./api-base";

export class AdminApiError extends Error {
  status: number;
  fields?: { path: string; message: string }[];

  constructor(
    status: number,
    message: string,
    fields?: { path: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function adminRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; csrf?: string } = {},
) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.csrf) headers["X-CSRF-Token"] = options.csrf;
  let response: Response;
  try {
    response = await fetch(API_BASE_URL + path, {
      method: options.method ?? "GET",
      credentials: "include",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(100_000),
    });
  } catch {
    throw new AdminApiError(
      0,
      "Le service d’administration est momentanément indisponible.",
    );
  }
  const body =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok)
    throw new AdminApiError(
      response.status,
      body?.error?.message ?? "Impossible de terminer cette opération.",
      body?.error?.fields,
    );
  return body as T;
}

export async function uploadAdminImage(
  file: File,
  csrf: string,
): Promise<string> {
  if (file.size > 8 * 1024 * 1024)
    throw new Error("L’image dépasse la taille maximale de 8 Mo.");
  const response = await fetch(API_BASE_URL + "/admin/media", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": file.type, "X-CSRF-Token": csrf },
    body: file,
    signal: AbortSignal.timeout(40_000),
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(
      body.error?.message ?? "Impossible de téléverser cette image.",
    );
  return body.src;
}

/** @deprecated Use uploadAdminImage for every managed editorial image. */
export const uploadArticleImage = uploadAdminImage;
