import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { afterEach, vi } from "vitest";

const makeSearchParams = (init?: Record<string, string>) =>
  new URLSearchParams(init) as ReadonlyURLSearchParams;

// Render pages without a Next.js runtime by stubbing the routing primitives.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string | { pathname: string };
    children: React.ReactNode;
  }) => (
    <a href={typeof href === "string" ? href : href.pathname} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: vi.fn(() => makeSearchParams()),
}));

// jsdom cannot navigate documents. Intercept anchor clicks so tests don't
// emit "Not implemented: navigation to another Document" noise.
document.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  if (target?.closest("a[href]")) {
    event.preventDefault();
  }
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.mocked(useSearchParams).mockReset();
  vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
});
