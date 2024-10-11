import type {Grammar, Options as StarryNightOptions} from '@wooorm/starry-night'

/**
 * Distance tuple.
 */
export type DistanceTuple = [name: string, distance: number]

/**
 * Configuration for `rehype-starry-night`.
 */
export interface Options extends StarryNightOptions {
  /**
   * Do not warn for missing scopes (default: `false`).
   */
  allowMissingScopes?: boolean | null | undefined
  /**
   * Grammars to support (default: `common`).
   */
  grammars?: ReadonlyArray<Grammar> | null | undefined
  /**
   * List of language names to not highlight (default: `[]`).
   */
  plainText?: ReadonlyArray<string> | null | undefined
}
