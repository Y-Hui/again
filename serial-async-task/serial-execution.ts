export interface SerialExecutionOptions<T> {
  /**
   * 异步任务列表
   */
  taskList: (() => Promise<T>)[]
  /**
   * 即使有任务失败，依然 resolve
   *
   * @default false
   */
  alwaysResolve?: boolean
  /**
   * 某个任务被 reject 时调用
   * @param index 任务所在任务列表中的索引位置
   * @param task  对应的任务
   */
  onTaskReject?: (error: unknown, index: number, task: () => Promise<T>) => void
  /**
   * 某个任务 resolve 时调用。
   * @param index 任务所在任务列表中的索引位置
   */
  onTaskResolve?: (value: T, index: number) => void
}

/**
 * 串行执行异步任务
 *
 * ```ts
 * const asyncTask = () => {} // 异步任务
 * const asyncTask2 = () => {} // 异步任务
 * const asyncTask3 = () => {} // 异步任务
 *
 * const task = [asyncTask, asyncTask2, asyncTask3]
 * serialAsyncTask(task).then(() => {
 *   // 所有异步任务结束后
 * })
 * ```
 */
async function serialExecution<T>(options: SerialExecutionOptions<T>) {
  const {
    taskList,
    alwaysResolve = false,
    onTaskReject,
    onTaskResolve,
  } = options
  const result: T[] = []
  await taskList.reduce(async (res, task, index) => {
    await res
    try {
      const val = await task()
      result.push(val)
      onTaskResolve && onTaskResolve(val, index)
      return Promise.resolve()
    } catch (error) {
      onTaskReject && onTaskReject(error, index, task)
      if (alwaysResolve) {
        return Promise.resolve()
      }
      return Promise.reject(error)
    }
  }, Promise.resolve())
  return result
}

export default serialExecution
