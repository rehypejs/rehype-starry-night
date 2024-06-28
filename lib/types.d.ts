import type {Grammar, Options as StarryNightOptions} from '@wooorm/starry-night'

/**
 * Configuration for `rehype-starry-night`.
 */
export interface Options extends StarryNightOptions {
  /**
   * Grammars (default: `all` from `@wooorm/starry-night`).
   */
  // To do: `null`.
  grammars?: ReadonlyArray<Grammar> | undefined
}
