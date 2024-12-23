type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

async function request(
  url: string,
  options: RequestOptions = {},
): Promise<Response> {
  const { method = "GET", headers = {}, body } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  return response;
}

async function $get(
  url: string,
  data?: Record<string, string>,
): Promise<Response> {
  if (data) {
    const params = new URLSearchParams(
      data as Record<string, string>,
    ).toString();
    return request(`${url}?${params}`);
  }
  return request(url);
}

async function $post(url: string, data: unknown): Promise<Response> {
  return request(url, { method: "POST", body: data });
}

async function $put(url: string, data: unknown): Promise<Response> {
  return request(url, { method: "PUT", body: data });
}

async function $del(
  url: string,
  data?: Record<string, string>,
): Promise<Response> {
  if (data) {
    const params = new URLSearchParams(
      data as Record<string, string>,
    ).toString();
    return request(`${url}?${params}`, { method: "DELETE" });
  }
  return request(url, { method: "DELETE" });
}

export const api = {
  $get,
  $post,
  $put,
  $del,
};
