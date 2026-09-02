# 第 15 节：Axios 请求层

## 1. 课程信息

| 项目 | 内容 |
| --- | --- |
| 节次 | 第 15 节 |
| 课程名称 | Axios 请求层 |
| 所属阶段 | 第四阶段：数据与登录 |
| 当前状态 | 🟨 学习中 |
| 开课日期 | 2026-09-02 |
| 实践产物 | 请求客户端、类型化模拟 API、请求结果展示 |

## 2. 本节目标

1. 能说明页面、业务 API 模块和 Axios 请求客户端各自负责什么。
2. 能创建统一 Axios 实例，并理解 `baseURL`、`timeout` 和拦截器的执行位置。
3. 能用泛型描述接口响应，让调用方获得正确的 TypeScript 类型提示。
4. 能区分请求参数、HTTP 错误和业务错误，并让错误继续被页面捕获。
5. 理解取消请求解决的问题，不把“取消”误认为“请求失败”。

## 3. 开课诊断

请先根据当前理解回答，不需要查资料，也不要求术语完全准确：

一个用户列表页需要请求 `/api/users?page=1`。如果项目里有十个页面都要请求接口，你认为下面哪些内容应该由每个页面自己写，哪些内容应该集中到公共位置？为什么？

- 接口地址 `/api/users`
- 当前页码 `page=1`
- 服务器基础地址，例如 `http://localhost:3000`
- 10 秒超时
- 把 token 放进请求头
- 网络失败时生成统一、可读的错误
- 请求成功后把用户列表渲染到页面

学生原回答：

> 当前页码 `page=1`  请求成功后把用户列表渲染到页面  

Coach 完整回答：

你的回答抓住了页面职责的核心：`page=1` 是当前页面的查询状态，拿到结果后把用户列表渲染出来也是页面工作。

还需要补上另外两层，完整划分如下：

- **页面层**：保存当前页码，决定何时请求，并把请求结果渲染出来。页面知道用户现在选了第几页，也知道界面要显示 loading、错误还是列表。
- **用户 API 模块**：保存业务接口地址 `/api/users`。它知道“获取用户列表要访问哪个地址”，但不知道页面此刻选了第几页，因此页码应由页面调用时传入。
- **公共请求客户端**：统一保存服务器基础地址、10 秒超时、自动携带 token，以及把网络失败整理成统一错误。这些规则会被多个业务接口共同使用，不应由十个页面重复编写。

可以把它理解成点外卖：页面是顾客，决定“这次点什么”；业务 API 模块像菜单，知道这道菜对应哪个下单入口；公共请求客户端像配送体系，统一处理送到哪个平台、身份凭证、等待多久和运输失败。顾客不需要每次重新设计配送体系。

所以完整调用方向是：

```text
页面：page = 1
  ↓ 调用 getUsers({ page: 1 })
用户 API：GET /api/users + params
  ↓ 交给公共客户端
Axios 客户端：补 baseURL、timeout、token，统一处理响应和错误
  ↓
服务器
```

本次诊断不要求一次答全。你已经能正确辨认页面层的两项职责；接下来重点建立 API 模块与公共请求客户端的边界。

## 4. 学习路线

1. 从“十个页面重复写请求配置”的问题认识分层。
2. 观察一次 Axios 请求从页面到服务器、再回到页面的完整链路。
3. 拆解 BuildAdmin 的请求实例、请求拦截、响应拦截和业务 API 模块。
4. 在练习项目中实现最小请求客户端与模拟 API。
5. 验证成功、业务失败与取消请求，并完成理解检查。

## 5. 教学与互动记录

### 2026-09-02：开课

已读取课程大纲、学习进度和第 14 节记录。第 14 节已经通过，后台骨架阶段结束；本节按计划进入 Axios 请求层。已确认练习项目尚未安装 Axios，尚无 `src/utils/http.ts` 与 `src/api`。BuildAdmin 的主要对照文件是 `web/src/utils/axios.ts`，业务调用示例是 `web/src/api/backend/index.ts`。

当前等待学生完成开课诊断。未虚构学生回答，尚未布置编码任务。

### 2026-09-02：诊断反馈与三层职责

学生把当前页码和列表渲染归到页面职责，判断正确。Coach 补全三层边界：页面管理本次交互状态与展示，业务 API 模块保存业务接口及参数约定，公共 Axios 客户端保存跨接口复用的传输规则。下一步通过一个请求变化场景检查学生是否理解这三层边界。

Coach 提问：

> 假设后端把服务器地址从 `http://localhost:3000` 改成 `https://api.example.com`，你认为应该修改每个页面、`users.ts` 业务 API 模块，还是公共 Axios 客户端？为什么？

学生原回答：

> 公共模块，应该用一个.env存放这些东西，然后axios客户端读取这个变量

Coach 完整回答：

正确。服务器基础地址属于所有请求共享、并且可能随开发环境和生产环境改变的配置，所以应由公共 Axios 客户端统一读取，而不是散落在页面或每个业务 API 模块里。

在 Vite 项目中可以写：

```dotenv
# .env.development
VITE_API_BASE_URL=http://localhost:3000
```

```dotenv
# .env.production
VITE_API_BASE_URL=https://api.example.com
```

客户端读取：

```ts
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
})
```

运行 `vite` 时使用开发环境配置，生产构建时使用生产环境配置。这里需要特别注意：前端的 `.env` 不是保险箱。Vite 只把 `VITE_` 前缀变量暴露给客户端代码，而这些值最终会进入浏览器可读取的构建产物。因此 API 基础地址可以放进去，数据库密码、私钥、第三方服务密钥不能放进去。token 也不是构建时环境变量；它是在用户登录后产生的运行时数据，之后由请求拦截器读取并放进请求头。

这项判断通过，学生已理解服务器基础地址应集中配置，并能联系 Vite 环境变量。

### 2026-09-02：请求拦截器与无 token 场景

Coach 提问：

> 如果用户尚未登录，`sessionStorage.getItem('token')` 得到 `null`，此时请求应该被拦截器阻止，还是应该继续发送但不携带 `Authorization`？为什么？

学生原回答：

> 应该继续发送啊，肯定不能没有token就拦截，如果拦截了不就不能登陆了吗

Coach 完整回答：

完全正确。公共请求客户端会服务于登录、验证码、公开配置等无需 token 的接口，也会服务于用户列表等受保护接口。如果请求拦截器发现没有 token 就直接阻断，那么用户连登录接口都无法调用。

更合理的公共规则是：有 token 就添加 `Authorization`，没有 token 就原样继续发送。具体接口是否必须登录，应由服务器鉴权；稍后的路由守卫可以控制页面入口，但路由守卫也不能代替服务器权限校验。

```ts
http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

`return config` 同样关键：请求拦截器属于异步链的一环，必须把本次配置交给下一环。学生能用登录接口说明不能全局阻断无 token 请求，这项理解通过。

### 2026-09-02：HTTP 成功与业务失败

Coach 给出的场景：服务器返回 HTTP 200，但响应体为 `{ "code": 0, "message": "账号已被禁用", "data": null }`，询问页面的 `await getUsers()` 应进入 `try` 还是 `catch`。

学生原回答：

> 响应客户端收到了就是try啊，没收到，或者返回的不是200的状态码就是catch啊

Coach 完整回答：

这个回答准确描述了 Axios 的默认 HTTP 判断：默认情况下，2xx 响应进入成功回调，非 2xx、超时和网络故障进入失败回调。但本题还存在项目自定义的第二层——业务状态判断。

HTTP 200 只表示请求到达服务器且服务器正常返回了一份 HTTP 响应，不保证“获取用户列表”这项业务成功。响应体的 `code: 0` 表示账号禁用，是业务失败。合理的响应拦截器会在成功回调里检查业务码，并主动返回拒绝状态：

```ts
http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body.code !== 1) {
      return Promise.reject(new Error(body.message))
    }
    return body.data
  },
  (error) => Promise.reject(error),
)
```

完整流向是：

```text
HTTP 200
→ Axios 响应成功回调
→ 检查到业务 code 为 0
→ Promise.reject(Error)
→ 页面 catch
```

所以在我们准备建立的请求层约定中，这个例子最终应进入 `catch`，错误信息是“账号已被禁用”。“客户端是否收到响应”不能单独决定页面走 try 还是 catch，因为 Promise 链中任意一环都可以根据项目规则把成功转为失败。

需要继续确认学生能区分“Axios 先进入哪个拦截器回调”和“页面最终进入 try/catch”这两个不同问题。

Coach 变式问题：HTTP 200、业务 `code: 1`，响应拦截器执行 `return body.data` 时，页面中的 `const users = await getUsers()` 最终得到什么？

学生原回答：

> ```json
> [{ "id": 1, "name": "小明" }]
> ```

Coach 完整回答：

正确。拦截器成功回调返回 `body.data`，Promise 链后面的页面便直接得到用户数组，而不是完整的 `{ code, message, data }`。这说明响应拦截器不仅能判断业务失败，还能改变后续调用者收到的数据形状。学生已能区分 HTTP 成功回调与页面最终结果，本项理解通过。

接下来用泛型表示统一响应：

```ts
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
```

`T` 是业务数据的占位符。`ApiResponse<User[]>` 中的 `data` 是用户数组；`ApiResponse<LoginResult>` 中的 `data` 是登录结果。外层业务协议只定义一次，各接口分别填入自己的数据类型。泛型只提供编译期检查，不会在运行时验证服务器 JSON。

## 6. 动手任务

### 任务一：建立最小 Axios 客户端

先安装运行依赖：

```powershell
npm.cmd install axios
```

然后新建 `F:\project\MyProject\ba-learn\src\utils\http.ts`，只完成以下内容：

1. 从 `axios` 导入默认导出。
2. 使用 `axios.create()` 创建并导出名为 `http` 的实例。
3. `baseURL` 读取 `import.meta.env.VITE_API_BASE_URL`。
4. `timeout` 设置为 10 秒。

同时在项目根目录新建 `.env.development`：

```dotenv
VITE_API_BASE_URL=/api
```

本任务暂不写拦截器，也不调用接口。完成标志是两个文件存在，并且 `http.ts` 不出现具体业务地址 `/users`。学生完成后通知 Coach 检查。

学生提交：

> 写完了

Coach 检查结果：Axios `^1.20.0` 已加入运行依赖，`.env.development` 已正确写入 `VITE_API_BASE_URL=/api`，`npm.cmd run type-check` 通过。实际文件保存为 `src/utils/axios.ts`，内容为：

```ts
import axios, {Axios} from "axios";

export const http = axios.create({
    baseURL: import.meta.env.BASE_URL,
    timeout: 10000,
})
```

当前有两项需要修正：

1. 题目指定 `src/utils/http.ts`，实际保存成了 `src/utils/axios.ts`。文件名本身没有技术上的唯一正确答案，但本课程后续导入路径按 `http.ts` 统一，应重命名。
2. `.env.development` 定义的是 `VITE_API_BASE_URL`，代码却读取了 Vite 内置的 `BASE_URL`。`BASE_URL` 通常是前端应用部署基础路径，不是刚定义的后端 API 地址。类型检查无法发现这种“两个值都是字符串但业务含义不同”的错误。

另外，命名导入的 `Axios` 当前没有使用，也不是创建实例所需内容，可以删除。本任务尚未通过，等待学生修正后复查。

学生反馈：

> 改完了

Coach 复查结果：

- 文件已正确调整为 `F:\project\MyProject\ba-learn\src\utils\http.ts`，旧的 `src/utils/axios.ts` 已不存在。
- 只保留了默认导入 `axios`。
- `baseURL` 正确读取 `import.meta.env.VITE_API_BASE_URL`。
- `timeout` 为 `10000` 毫秒，即 10 秒。
- `.env.development` 保持 `VITE_API_BASE_URL=/api`。
- `npm.cmd run type-check` 通过。

任务一通过。代码使用双引号、分号以及 `10000` 而不是 `10_000` 都只是等价风格，不影响本节验收。

### 任务二：添加请求拦截器

修改 `F:\project\MyProject\ba-learn\src\utils\http.ts`：

1. 在 `http` 实例创建后注册请求拦截器。
2. 从 `sessionStorage` 读取键名为 `token` 的值。
3. 有 token 时设置 `config.headers.Authorization`，值为 `Bearer ${token}`。
4. 无 token 时不阻止请求。
5. 无论有无 token，成功回调最后都返回 `config`。

暂时只写请求成功回调，不添加响应拦截器，也不要求人为制造错误。完成后通知 Coach 检查。

学生提交：

> 写完了

Coach 检查到的实现：

```ts
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token)
        config.headers.Authorization = `Bearer ${token}`
    return config
});
```

`Bearer` 格式正确；有 token 才添加请求头；无 token 分支仍会执行 `return config`；`npm.cmd run type-check` 通过。唯一需要修正的是任务指定从 `sessionStorage` 读取，实际使用了 `localStorage`。

两者技术上都能保存字符串，但生命周期不同：`sessionStorage` 通常在当前标签页会话结束时清除，`localStorage` 会跨浏览器重启保留。选择哪一个会影响登录保持策略，不能在调用端写入一种存储、拦截器却读取另一种存储。第 16 节实现登录状态时会统一决定正式方案；本任务为了让输入端与读取端一致，先按指定改为 `sessionStorage.getItem("token")`。任务二等待这一处修正后通过。

学生反馈：

> 改完了

Coach 复查结果：已改为 `sessionStorage.getItem("token")`，其他正确逻辑保持不变，`npm.cmd run type-check` 再次通过。任务二通过。

### 任务三：定义统一响应与用户类型

新建 `F:\project\MyProject\ba-learn\src\api\types.ts`，导出：

1. 泛型接口 `ApiResponse<T>`，包含 `code: number`、`message: string`、`data: T`。
2. `User` 接口，包含 `id: number` 和 `name: string`。

本任务只定义类型，不写请求函数，不使用 `any`，也不需要创建模拟数据。完成后通知 Coach 检查。

学生提交：

> 写完了

Coach 检查结果：

```ts
export interface ApiResponse<T> {
    code: number,
    message: string,
    data: T,
}

export interface User {
    id: number,
    name: string,
}
```

泛型 `T` 正确用于 `data`，两个接口的字段与类型符合要求，未使用 `any`，`npm.cmd run type-check` 通过。接口成员使用逗号分隔是合法 TypeScript 语法，仅属风格选择，不影响验收。任务三通过。

### 任务四：业务解包响应拦截器

修改 `F:\project\MyProject\ba-learn\src\utils\http.ts`：

1. 使用 `import type` 从 `../api/types` 导入 `ApiResponse`。
2. 注册响应拦截器，并同时提供成功回调和失败回调。
3. 成功回调把 `response.data` 当作 `ApiResponse<unknown>` 读取。
4. 若 `body.code !== 1`，返回 `Promise.reject(new Error(body.message))`。
5. 若业务成功，返回 `body.data`。
6. 失败回调原样 `return Promise.reject(error)`。

这里使用 `unknown` 表示公共层暂时不知道各接口的具体 data 类型，但不允许未经判断随意使用它。下一任务会由业务 API 模块通过泛型补上具体的 `User[]`。本任务不显示 Element Plus 提示，也不改请求拦截器。完成后通知 Coach 检查。

学生提交：

> 写完了

Coach 检查到的关键实现：

```ts
import type {ApiResponse} from "@/api/types.ts";
import * as constants from "node:constants";

http.interceptors.response.use((res) => {
    const result: ApiResponse<any> = res.data
    if (result.code!==1)
        return Promise.reject(new Error(result.message))
    return result.data
}, (err) => {
    return Promise.reject(err)
})
```

成功回调能判断 `code !== 1`、业务失败能转为 rejected Promise、成功能返回 data，失败回调也继续 reject，这些流程正确。但有两项需要修正：

1. 删除无关的 `import * as constants from "node:constants"`。这是 Node 运行时模块，当前浏览器请求客户端不需要它；它还导致类型检查报 `TS2591: Cannot find name 'node:constants'`。不能为了这个误导入去扩大 tsconfig 的 Node 类型范围，应删除根因。
2. 把 `ApiResponse<any>` 改为 `ApiResponse<unknown>`。`any` 会允许公共层对未知业务数据任意操作，相当于关闭类型检查；`unknown` 诚实表达“这里尚不知道具体类型”，后续由业务 API 的泛型补全。

类型导入使用别名且带 `.ts` 在当前项目配置下未成为报错，但课程给出的相对路径 `../api/types` 更少依赖别名配置。它不是本次阻塞项。任务四等待上述两项修正。

学生反馈：

> 写完了

Coach 复查结果：无关的 `node:constants` 已删除，`ApiResponse<any>` 已改为 `ApiResponse<unknown>`。但类型检查出现新的有效错误：

```text
TS2345: 响应成功回调返回 unknown，不能赋给 AxiosResponse 或 Promise<AxiosResponse>
```

原因是当前 Axios 版本对实例响应拦截器的类型约定是“输入 AxiosResponse，输出仍为 AxiosResponse”。代码运行时确实可以返回 `result.data`，但这样会让 Axios 实例声明的静态返回类型与实际值不一致。用 `as any` 压掉报错会隐藏这个矛盾。

学生反馈：

> 改完了

Coach 再次检查：学生将成功分支改成了 `return result`，但 `result` 是 `res.data` 对应的 `ApiResponse<unknown>`，仍不是完整 Axios 响应，因此类型检查继续报 TS2345，并明确提示缺少 `status`、`statusText`、`headers`、`config`。需要返回的是回调参数 `res`，不是局部变量 `result`。等待把这一行精确改为 `return res`。

学生原提问：

> 返回res.data不会报错

Coach 完整回答：

是的，在当前 Axios 默认类型下，直接 `return res.data` 很可能不会报错，但这是因为 `res` 默认是 `AxiosResponse<any>`，所以 `res.data` 是 `any`。`any` 可以赋给任何类型，TypeScript 会停止检查它，并不代表响应拦截器的静态返回类型已经随运行时结果一起变成了业务数据。

对比如下：

```ts
const a = res.data                         // any：返回时不报错
const b: ApiResponse<unknown> = res.data  // 明确类型后不再是 any

return a // any 绕过检查
return b // 报错：ApiResponse 不是 AxiosResponse
```

隐藏的问题会出现在调用端：

```ts
const response = await http.get('/users')
```

如果拦截器运行时返回 `res.data`，`response` 实际是业务响应体；但 Axios 的类型声明仍可能告诉编辑器它是完整 `AxiosResponse`，声称存在 `response.status`、`response.headers` 等字段。代码可能通过类型检查，运行时这些字段却是 `undefined`。这是“没有类型报错，但类型与真实值不一致”。

本课采用更直接的类型安全方案：拦截器验证后 `return res`，保持 Axios 契约；之后自定义 `request<T>` 明确返回 `Promise<T>`，并在函数体里解包 `response.data.data`。直接返回 `res.data` 也可以设计成另一套封装，但需要同步为客户端声明正确的调用签名，不能只依赖 `any` 让报错消失。

学生原提问：

> 那为什么buildadmin返回res.data

Coach 完整回答：

BuildAdmin 确实这样做，但它采用了另一套返回约定，并在封装边界主动承担了类型断言的责任。实际源码是：

```ts
function createAxios<Data = any, T = ApiPromise<Data>>(...): T {
  // 响应拦截器
  return options.reductDataFormat ? response.data : response

  // 函数出口
  return Axios(axiosConfig) as T
}
```

全局类型为：

```ts
interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
  time: number
}

type ApiPromise<T = any> = Promise<ApiResponse<T>>
```

关键区别有三点。

第一，BuildAdmin 默认返回的 `response.data` 是整个业务响应体 `ApiResponse<T>`，不是更里面的 `response.data.data`。所以页面默认拿到的仍是 `{ code, data, msg, time }`。

第二，Axios 的 `response.data` 默认带有 `any`，因此拦截器返回它不会触发我们刚才看到的类型错误。BuildAdmin 随后又在函数出口使用 `as T`，明确告诉 TypeScript：“请相信这个封装最终返回 T”。这不是 TypeScript 自动推导出的证明，而是封装作者作出的类型承诺。

第三，BuildAdmin 有 `reductDataFormat` 选项：默认返回业务响应体；关闭时返回完整 Axios 响应。因此它用第二个泛型 `T` 支持不同返回形态。灵活性的代价是断言较强，如果运行时分支与调用者填写的 `T` 不一致，编译器无法发现。

BuildAdmin 锁定 Axios 1.9.0，本练习当前是 1.20.0，但这里的根本差异不是版本，而是 `response.data` 的 `any` 和 `return Axios(...) as T` 这两处主动放宽。

本课当前方案更显式：拦截器返回完整 `res`，保持 Axios 自带类型成立；`request<T>` 在普通函数中明确解包，并由 TypeScript 检查 `Promise<T>`。等学生理解后，也可以实现一个 BuildAdmin 风格的 `createAxios`，但必须认识其中的断言边界，不能把“不报错”理解成“编译器已经验证正确”。

本课因此采用更清楚的类型安全方案：响应拦截器只验证业务码，成功时 `return res` 保留完整响应；下一任务封装的 `request<T>` 再从 `response.data.data` 解包业务数据。职责变为：

```text
响应拦截器：统一判断成功或失败
request<T>：把 ApiResponse<T> 解包成 T
业务 API：决定 T 是 User[]、LoginResult 等具体类型
```

学生需把任务四成功分支的 `return result.data` 改为 `return res`。业务失败与错误回调的 reject 保持不变。修正后再复查。

学生反馈：

> 我改好了

Coach 复查结果：成功分支已精确改为 `return res`；业务失败仍 reject `Error(result.message)`，HTTP/网络失败仍原样 reject；`npm.cmd run type-check` 通过。任务四通过。

### 任务五：封装泛型 request 函数

继续修改 `F:\project\MyProject\ba-learn\src\utils\http.ts`：

1. 在 Axios 类型导入中加入 `AxiosRequestConfig`，必须使用 type-only import。
2. 导出异步泛型函数 `request<T>`，参数为 `config: AxiosRequestConfig`，返回类型为 `Promise<T>`。
3. 函数中调用 `http.request<ApiResponse<T>>(config)`，得到完整 AxiosResponse。
4. 返回 `response.data.data`。

这里第一个 `.data` 是 AxiosResponse 的响应体，类型为 `ApiResponse<T>`；第二个 `.data` 是统一业务响应中的真正数据，类型为 `T`。不要使用 `any` 或类型断言。完成后通知 Coach 检查。

学生提交：

> 写完了

Coach 检查到的实现：

```ts
export async function request<T>(
    config: AxiosRequestConfig,
): Promise<T> {
    const res = await http.request<ApiResponse<any>>(config)
    return res.data.data
}
```

函数参数、显式返回类型、Axios 调用和两层 data 解包结构正确，`npm.cmd run type-check` 通过。但内部使用 `ApiResponse<any>`，使函数入口声明的 `T` 没有连接到服务器响应。第二个 `data` 因此是 any，它可以冒充返回类型 T，所以类型检查通过却没有提供真实约束。

应改为：

```ts
const res = await http.request<ApiResponse<T>>(config)
```

这样类型链才是 `request<T>` → `ApiResponse<T>` → `res.data.data: T`。任务五等待这一处修正后复查。

学生反馈：

> 写完了

Coach 复查结果：内部泛型已改为 `http.request<ApiResponse<T>>(config)`，两层 data 解包最终得到 T，未使用 any 或类型断言，`npm.cmd run type-check` 通过。任务五通过。

### 任务六：用户业务 API

学生按要求新建 `F:\project\MyProject\ba-learn\src\api\users.ts`，实现 `UserQuery { page: number }` 和 `getUsers(params, signal?)`。函数调用 `request<User[]>`，配置 `/users`、GET、params 和 signal。文件未读取环境变量或 token，也未处理页面渲染；`npm.cmd run type-check` 通过。任务六通过。

### 任务七：建立成功响应的模拟服务器

先安装仅用于开发和课程演示的依赖：

```powershell
npm.cmd install -D axios-mock-adapter
```

新建 `F:\project\MyProject\ba-learn\src\mock\httpMock.ts`：

1. 默认导入 `axios-mock-adapter` 的 `MockAdapter`。
2. 从 `../utils/http` 导入 `http` 实例。
3. 创建 `new MockAdapter(http, { delayResponse: 600 })`。
4. 匹配 GET `/users` 且 params 为 `{ page: 1 }`。
5. 返回 HTTP 200，响应体业务 `code` 为 1、`message` 为 `ok`，data 中放入 `{ id: 1, name: '小明' }` 和 `{ id: 2, name: '小红' }`。

模拟器必须绑定 `http` 实例，因为请求拦截器和业务 API 都使用这个实例。暂时不要修改页面；完成后通知 Coach 检查。

学生原反馈：

> 跳过这个吧，我暂时只想搞前端，这个模拟请求感觉不必要，我感觉这边就可以了，如果后续还有很多课程需要用到这些模拟请求的话，我可以用springboot写个后端

Coach 完整回答：

可以跳过。`axios-mock-adapter` 本身是运行在前端开发环境中的测试工具，不是在课程里额外学习后端；它原本用于在没有服务器时让 Axios 的成功、业务失败和取消链路可重复验证。不过当前已经完成请求客户端、请求/响应拦截器、泛型解包和用户 API 边界，本节可以把模拟 API 从必做项降为可选，不要求为了本节维护假数据层。

后续第 16～18 节的登录、守卫和错误反馈，以及第 19～24 节 CRUD 会需要可调用的数据来源。届时可以接学生编写的 Spring Boot 后端，也可以按当时进度采用最小模拟；不提前要求现在开发后端。无论数据来自真实后端还是模拟器，`users.ts` 与 `http.ts` 的分层不变。

任务七按学生选择取消，不视为未完成作业。由于未发出实际 HTTP 请求，本节运行时的成功、业务失败与取消路径没有实测；以类型检查、生产构建和核心理解检查作为调整后的验收范围。`npm.cmd run build` 已通过，Vite 仅报告主产物超过 500 kB 的非阻塞提示。

学生反馈：

> 写完了

Coach 复查结果：内部调用已改为 `http.request<ApiResponse<T>>(config)`，`request<T>` 的泛型现已贯穿响应体和最终返回值；未使用 any 或类型断言，`npm.cmd run type-check` 通过。任务五通过。

### 任务六：建立用户业务 API

新建 `F:\project\MyProject\ba-learn\src\api\users.ts`：

1. 导入 `request` 和 `User` 类型。
2. 导出 `UserQuery` 接口，当前只包含 `page: number`。
3. 导出 `getUsers(params: UserQuery, signal?: AbortSignal)`。
4. 函数返回 `request<User[]>({...})`。
5. 请求配置为 `url: '/users'`、`method: 'GET'`，并传入 `params` 和 `signal`。

这个模块只知道用户接口规则，不读取环境变量、不处理 token、不渲染页面。完成后通知 Coach 检查。

计划产物位于：

- `F:\project\MyProject\ba-learn\src\utils\http.ts`
- `F:\project\MyProject\ba-learn\src\api\types.ts`
- `F:\project\MyProject\ba-learn\src\api\users.ts`
- 一个现有或新建页面，用于展示模拟请求结果

## 7. 本节理解检查

已进入最后一项取消请求理解检查。

Coach 提问：

> 用户连续搜索 `a → ab → abc`，一共发出三个请求。如果最早的 `a` 请求最后才返回，它可能造成什么问题？`AbortSignal` 在这里有什么作用？

学生原回答：

> 后面的数据覆盖前面的数据，不清楚

Coach 完整回答：

学生已经意识到并发请求会发生结果覆盖，但方向说反了。真正危险的是“前面发出的旧请求，后面才返回”，从而覆盖较新的正确结果。

例如按发送顺序：

```text
第 1 个请求：a
第 2 个请求：ab
第 3 个请求：abc
```

服务器不保证按发送顺序完成。可能按以下顺序返回：

```text
abc 先返回 → 页面显示 abc 的搜索结果（正确）
ab  随后返回 → 页面被较旧结果覆盖
a   最后返回 → 页面最终显示 a 的结果（最旧、错误）
```

`AbortController` 为一次请求提供 `signal`。当用户输入新关键词时，调用旧 controller 的 `abort()`，Axios 会让旧请求的 Promise 以取消状态结束；页面识别取消错误后不更新列表，也通常不向用户显示“网络失败”。新请求使用新的 controller。

取消主要防止旧结果覆盖和减少无意义等待，但不保证服务器撤销已经开始的业务操作，不能代替后端的撤销接口或幂等设计。当前需要通过一个变式问题确认返回顺序。

Coach 变式问题：

> 如果 `abc` 先返回，`a` 最后返回，而且没有取消旧请求，那么页面最终可能显示哪个关键词对应的结果？

学生原回答：

> a的结果

Coach 完整回答：

正确。最后返回的旧请求会最后一次修改页面状态，因此页面可能显示 a 的结果，即使输入框中的最新关键词已经是 abc。学生已修正新旧覆盖方向，理解取消旧请求是为了避免过时结果更新页面。取消请求核心检查通过。

## 8. 验收结果

🟩 已通过本节核心验收。

已完成统一 Axios 实例、环境基础地址、10 秒超时、token 请求拦截器、业务码响应检查、错误 reject、`ApiResponse<T>`、类型安全的 `request<T>`、用户列表业务 API 与 AbortSignal 入口。类型检查和生产构建通过。

模拟 API 按学生选择取消，不作为阻塞项，因此本节没有实际发送请求验证运行时成功、业务失败和取消路径。后续登录或 CRUD 接入 Spring Boot 后端时补做真实链路验证。Vite 主产物超过 500 kB 为既有非阻塞提示。

## 9. 学习小结

本节建立了“页面 → 业务 API → 公共请求客户端 → 服务器”的职责边界。页面保存页码和渲染结果；`users.ts` 描述用户接口；`http.ts` 统一处理 baseURL、超时、token、业务码和传输错误。

学生通过实际类型错误理解了 `any` 与 `unknown` 的区别，以及“代码不报错”不等于静态类型和运行时值一致。通过对照 BuildAdmin，理解其默认返回整个 `ApiResponse<T>`，并在 `createAxios` 出口以 `as T` 承担类型承诺；本课实现则保留完整 AxiosResponse，由 `request<T>` 显式解包成业务数据 T。

取消请求方面，学生最终能判断旧请求晚到会覆盖最新结果，理解 AbortSignal 用于停止已无意义的旧请求，但不能代替后端业务撤销。

## 10. 进度更新

- 2026-09-02：创建第 15 节课程目录、互动课程记录和独立教材；课程标记为学习中。
- 2026-09-02：学生完成开课诊断，正确指出页码状态和列表渲染属于页面；已完整讲解页面、业务 API 模块和公共请求客户端的职责边界。
- 2026-09-02：任务一首次检查：Axios 依赖、环境文件和 10 秒超时已完成，类型检查通过；发现客户端文件名与指定路径不一致，并误读 `import.meta.env.BASE_URL`，等待修正为 `src/utils/http.ts` 与 `VITE_API_BASE_URL`。
- 2026-09-02：任务一复查通过；客户端文件路径、环境变量读取和依赖均正确，旧文件已移除，类型检查通过。进入请求拦截器学习。
- 2026-09-02：学生正确判断基础地址应由公共模块从 `.env` 读取；已补充 Vite 模式文件、`VITE_` 暴露规则、构建时配置与登录后运行时 token 的区别，并布置任务一：最小 Axios 客户端。
- 2026-09-02：学生正确指出无 token 时仍应发送请求，否则登录接口也会被公共客户端阻断；已讲解公开接口与受保护接口共用客户端的边界，并布置任务二请求拦截器。
- 2026-09-02：任务二首次检查：请求头格式、条件添加、返回 config 和类型检查均正确；读取位置写成 localStorage，与任务指定的 sessionStorage 不一致，已讲解两者生命周期及读写一致性，等待修正。
- 2026-09-02：任务二复查通过；token 读取已改为 sessionStorage，请求拦截器和类型检查正确。进入 HTTP 状态与业务状态的区分。
- 2026-09-02：学生按 Axios 默认规则把 HTTP 200 判断为页面 try；已讲解 HTTP 成功但业务 code 失败时，响应成功回调会主动 reject，因此页面最终进入 catch。等待用变式问题确认两层判断。
- 2026-09-02：变式问题通过；学生正确指出成功回调返回 body.data 后，页面直接获得用户数组。已讲解泛型统一响应结构，并布置任务三定义 ApiResponse<T> 与 User。
- 2026-09-02：任务三通过；ApiResponse<T>、User 及类型检查均正确。布置任务四：用 ApiResponse<unknown> 判断业务码、解包 data，并保持失败 Promise 拒绝状态。
- 2026-09-02：任务四首次检查：业务判断、解包和两类 reject 流程正确；误导入 node:constants 导致 TS2591，且使用 any 失去类型保护。已要求删除无关导入并改为 ApiResponse<unknown>。
- 2026-09-02：任务四二次检查：两项原问题已修正；Axios 当前类型契约不接受拦截器返回 unknown，TS2345。调整为拦截器验证后返回完整 response，后续由 request<T> 类型安全解包，等待把成功分支改为 return res。
- 2026-09-02：任务四第三次检查：成功分支误写为 return result；result 是业务响应体，res 才是完整 AxiosResponse。类型检查仍报 TS2345，等待精确修正为 return res。
- 2026-09-02：学生指出 return res.data 不会报错；已解释 res.data 默认是 any，因此能绕过检查，但 Axios 静态返回类型与拦截器运行时值会不一致。本课继续采用拦截器返回 res、request<T> 明确解包的类型安全方案。
- 2026-09-02：学生追问 BuildAdmin 为何返回 res.data；已对照源码解释其默认返回整个 ApiResponse<T>、利用 res.data 的 any，并在 createAxios 出口通过 as T 承担类型承诺；说明与本课显式 request<T> 解包方案的差异。
- 2026-09-02：任务四最终复查通过；拦截器成功时返回完整 res，业务失败与传输失败保持 reject，类型检查通过。布置任务五泛型 request<T> 解包函数。
- 2026-09-02：任务五首次检查：函数结构与解包正确且类型检查通过，但内部误用 ApiResponse<any> 断开泛型链；已要求改为 ApiResponse<T>，使响应 data 真正推导为 T。
- 2026-09-02：任务五复查通过；ApiResponse<T> 将具体类型贯穿到两层 data 解包，类型检查通过。
- 2026-09-02：任务六通过；业务 API `/users`、GET、page 参数、User[] 返回型和 AbortSignal 均正确，类型检查通过。布置任务七创建成功响应的 Axios 模拟服务器。
- 2026-09-02：学生选择跳过模拟 API，并提出后续可接 Spring Boot。接受范围调整：本节不新增假数据层，后续需要数据时再决定真实后端或最小模拟；生产构建通过，等待取消请求理解检查后结课。
- 2026-09-02：取消请求首次检查：学生意识到会发生数据覆盖，但把新旧方向说反且不清楚 AbortSignal；已用发送与返回时间线讲解旧请求晚到覆盖新结果，以及 abort 让旧 Promise 取消、防止旧结果更新页面。等待变式确认。
- 2026-09-02：学生正确判断无取消时 a 请求最后返回会让页面显示 a 的旧结果，取消请求检查通过。
- 最终状态：🟩 已完成。
- 已完成课程数：15 / 30。
- 下一步：第 16 节登录页与登录状态。
- 2026-09-02：任务五复查通过；泛型 T 已贯穿 request、ApiResponse 和最终业务 data，类型检查通过。布置任务六用户业务 API，并预留 AbortSignal。
