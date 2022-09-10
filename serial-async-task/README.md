## 异步任务串行

适用于异步返回结果为同类型的情况。

比如：串行请求接口。

### 基本
```ts
import serialExecution from './serial-execution'

const asyncTask = () => Promise.resolve(1)
const asyncTask2 = () => Promise.resolve(2)
const asyncTask3 = () => Promise.resolve(3)

serialExecution({
  taskList: [asyncTask, asyncTask2, asyncTask3],
}).then((value) => {
  // value 为 [1, 2, 3]
})
```

### Reject
```ts
import serialExecution from './serial-execution'

const asyncTask = () => Promise.resolve(1)
const asyncTask2 = () => Promise.reject(Error('STOP'))
const asyncTask3 = () => Promise.resolve(3)

// 第二个任务失败，后续任务不再执行
serialExecution({
  taskList: [asyncTask, asyncTask2, asyncTask3],
})

// 无论任务是否失败，都将继续执行其他任务
serialExecution({
  taskList: [asyncTask, asyncTask2, asyncTask3],
  alwaysResolve: true,
  // 某个任务失败的回调
  onReject(error, index, task) {},
})
```
