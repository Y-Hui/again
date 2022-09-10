## withRetries

Promise 错误重试。

默认重试 3 次。

### 基本

```ts
import withRetries from './promise-retry'

let times = 0
const asyncTask = () => {
  times += 1
  if (times >= 3) {
    return Promise.resolve('success')
  } else {
    return Promise.reject(Error('STOP'))
  }
}

// 重试 4 次
withRetries(asyncTask, { times: 4 }).then(() => {})
```

### 重试前延迟

```ts
// 重试前延迟 100 ms
withRetries(asyncTask, { delay: 100 }).then(() => {})

// count 为第几次重试
withRetries(asyncTask, { delay: (count) => 100 }).then(() => {})
```
