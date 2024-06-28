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
   * Grammars to support (default: `common`).
   */
  grammars?: ReadonlyArray<Grammar> | null | undefined
}
