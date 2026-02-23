import { testConfig } from "./init";

export interface RequestOptions {
  method?: string;
  body?: unknown;
  idToken: string;
  headers?: Record<string, string>;
}

/**
 * Reusable HTTP request helper using fetch.
 * Uses API_BASE_URL from test config. Pass idToken for authenticated endpoints.
 */
export async function request(
  path: string,
  options: RequestOptions
): Promise<Response> {
  const { method = "GET", body, idToken, headers: customHeaders = {} } = options;
  const baseUrl = testConfig.api.baseUrl.replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": idToken,
    ...customHeaders,
  };
 
  const init: RequestInit = {
    method,
    headers,
  };
  if (body !== undefined && body !== null && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  // console.log(url,init)
  return await fetch(url, init);
}

/**
 * Creates a note via POST /notes. Uses the shared request helper.
 */
export async function createNote(
  name: string,
  idToken: string
): Promise<Response> {
  return await request("/notes", {
    method: "POST",
    body: { name },
    idToken,
  });
}

/**
 * Updates a note via PUT /notes/:id. Uses the shared request helper.
 */
export async function updateNote(
  noteId: string,
  name: string,
  idToken: string
): Promise<Response> {
  return await request(`/notes/${noteId}`, {
    method: "PUT",
    body: { name },
    idToken,
  });
}
