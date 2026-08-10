declare module "aos" {
  interface AosOptions {
    duration?: number;
    once?: boolean;
    easing?: string;
    offset?: number;
    delay?: number;
    anchorPlacement?: string;
    disable?: boolean | string | (() => boolean);
  }

  export function init(options?: AosOptions): void;
  export function refresh(): void;
  export function refreshHard(): void;

  const AOS: {
    init(options?: AosOptions): void;
    refresh(): void;
    refreshHard(): void;
  };

  export default AOS;
}
