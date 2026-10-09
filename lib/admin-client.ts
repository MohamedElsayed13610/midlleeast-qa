// Browser-side helpers shared by the admin dashboard sections (cookie session, same-origin JSON).
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export type ApiResponse = { error?: string; email: string; items: unknown[]; url: string; width: number; height: number };

export async function api(path: string, options: RequestInit = {}): Promise<ApiResponse> {
  const response = await fetch(`/api/admin/${path}`, { ...options, credentials: "same-origin", cache: "no-store" });
  const data = await response.json().catch(() => ({ error: "تعذّر الاتصال. حاول مرة أخرى." })) as ApiResponse;
  if (!response.ok) throw new ApiError(response.status, data.error || "تعذّر إتمام العملية.");
  return data;
}
export const json = (method: string, body: unknown) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
