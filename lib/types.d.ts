import type {Grammar, Options as StarryNightOptions} from '@wooorm/starry-night'

/**
 * Configuration for `rehype-starry-night`.
 */
export interface Options extends StarryNightOptions {
  /**
   * Grammars to support (default: `all`).
   */
  // To do: change to `common`.
  grammars?: ReadonlyArray<Grammar> | null | undefined
}
