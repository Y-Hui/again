export interface WithRetriesOptions {
  /**
   * 重试次数
   */
  times?: number
  /**
   * 重试前延迟，默认不延迟
   *
   * @param count 第几次
   */
  delay?: number | ((count: number) => number)
}

function withDelay<T>(task: () => Promise<T>, delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay)).then(task)
}

/**
 * 为 Promise 添加错误重试，默认重试 3 次
 *
 * ```ts
 * const asyncTask = () => Promise.reject(Error('STOP')) // 异步任务
 * withRetries(asyncTask).then(() => {})
 * ```
 */
function withRetries<T>(task: () => Promise<T>, options?: WithRetriesOptions) {
  const { times = 3, delay } = options || {}
  let asyncTask = task()

  const noDelay = delay === null || delay === undefined

  const delayTask = (count: number) => {
    if (noDelay) return task
    const delayTime = typeof delay === 'function' ? delay(count) : delay
    return () => withDelay(task, delayTime)
  }

  return new Promise<T>((resolve, reject) => {
    for (let i = 0; i < times; i += 1) {
      /**
       * 此处重新赋值才能生效
       * Promise.then 和 Promise.catch 通过返回 Promise 来实现链式调用
       *
       * 若不赋值，则与此写法无异：
       * let asyncTask = task()
       * asyncTask.catch(task)
       * asyncTask.catch(task)
       * asyncTask.catch(task)
       *
       * 上面这些 .catch 都注册在 asyncTask 的 Promise 上。
       * 而重新赋值则是将 .catch 注册在上一个 .catch 的 Promise 上。
       * 等同于以下写法：
       * const asyncTask = task()
       * const catch1 = asyncTask.catch(task)
       * const catch2 = catch1.catch(task)
       * const catch3 = catch2.catch(task)
       * 可以简化为：
       * task().catch(task).catch(task).catch(task)
       *
       * 而此处的 for 循环便是帮助生成这样的写法：
       * task().catch(task).catch(task).catch(task)
       */
      asyncTask = asyncTask.catch(delayTask(i))
    }
    asyncTask.then(resolve).catch(reject)
  })
}

export default withRetries

// function withRetries<T>(task: () => Promise<T>, retryCount = 3) {
//   let times = retryCount
//   return new Promise<T>((resolve, reject) => {
//     const fn = () => {
//       task().then(resolve, (error) => {
//         if (times <= 0) {
//           reject(error)
//           return
//         }
//         times -= 1
//         setTimeout(() => {
//           fn()
//         })
//       })
//     }
//     fn()
//   })
// }
