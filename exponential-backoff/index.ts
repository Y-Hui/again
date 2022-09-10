export interface ExponentialBackoffOptions {
  /**
   * 初始间隔时间 (ms)
   *
   * @default 500
   */
  slotTime?: number
  /**
   * 最大时长，时间超出后则始终返回此值
   */
  maxTime?: number
}

/**
 * [`指数退避`](https://en.wikipedia.org/wiki/Exponential_backoff)
 *
 * ```ts
 * import getDelay from './exponential-backoff'
 * getDelay(0) // 500+ ms
 * getDelay(1) // 1000+ ms
 * getDelay(2) // 2000+ ms
 * ```
 */
function createExponentialBackoff(
  times: number,
  options?: ExponentialBackoffOptions,
) {
  const { slotTime = 500, maxTime } = options || {}

  const randomTime = Math.floor(Math.random() * slotTime)
  const delay = 2 ** times * slotTime + randomTime

  if (maxTime !== undefined && maxTime !== null && delay > maxTime) {
    return maxTime
  }

  return delay
}

export default createExponentialBackoff
