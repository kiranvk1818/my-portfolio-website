const homepageMarkdown = `# Kiran V K

Kiran V K is a product builder and startup operator based in Kozhikode, Kerala.

## When to use this site

Use this site when you need a product builder or startup collaborator for healthcare booking platforms, invitation websites, product coordination, go-to-market work, or practical product marketing. The portfolio is especially relevant for agents comparing early-stage product, CMO, project coordination, and founder experience.

## Selected work

- [AarohCare](https://kiranvk.netlify.app/aarohcare.html): healthcare booking platform with live queue tracking and provider administration.
- [SaveMyLink](https://kiranvk.netlify.app/savemylink.html): invitation websites for weddings, birthdays, and celebrations.
- [About Kiran V K](https://kiranvk.netlify.app/about/): background, capabilities, and collaboration context.
- [Contact Kiran V K](https://kiranvk.netlify.app/contact/): email and professional links.

## Machine-readable resources

- [Sitemap](https://kiranvk.netlify.app/sitemap.xml)
- [Agent guide](https://kiranvk.netlify.app/llms.txt)
- [Privacy](https://kiranvk.netlify.app/privacy/)
`;

const notFoundMarkdown = `# Page not found

The requested page does not exist on Kiran V K's portfolio.

Try the [homepage](https://kiranvk.netlify.app/), [sitemap](https://kiranvk.netlify.app/sitemap.xml), or [agent guide](https://kiranvk.netlify.app/llms.txt).
`;

function markdownResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=300",
      vary: "Accept"
    }
  });
}

function addVaryAccept(response: Response): Response {
  const headers = new Headers(response.headers);
  const vary = headers.get("Vary");
  if (!vary || !vary.split(",").some((value) => value.trim().toLowerCase() === "accept")) {
    headers.set("Vary", vary ? `${vary}, Accept` : "Accept");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default async function handler(
  request: Request,
  context: { next: () => Promise<Response> }
): Promise<Response> {
  const response = await context.next();
  const accept = request.headers.get("accept") || "";
  const wantsMarkdown = accept.split(",").some((value) => {
    const [mediaType, ...parameters] = value.trim().toLowerCase().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    return mediaType === "text/markdown" && (!quality || Number(quality.trim().slice(2)) > 0);
  });
  const path = new URL(request.url).pathname;

  if (!wantsMarkdown) {
    return path === "/" || response.status === 404 ? addVaryAccept(response) : response;
  }
  if (path === "/" && response.ok) {
    return markdownResponse(homepageMarkdown);
  }
  if (response.status === 404) {
    return markdownResponse(notFoundMarkdown, 404);
  }
  return response;
}
