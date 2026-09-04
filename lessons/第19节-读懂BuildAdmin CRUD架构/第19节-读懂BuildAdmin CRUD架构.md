# 第 19 节：读懂 BuildAdmin CRUD 架构

## 1. 课程信息

| 项目 | 内容 |
| --- | --- |
| 节次 | 第 19 节 |
| 课程主题 | 读懂 BuildAdmin CRUD 架构 |
| 当前状态 | 学习中 |
| 开始日期 | 2026-09-04 |
| 源码主线 | `web/src/views/backend/user/user/index.vue` → `web/src/utils/baTable.ts` → `web/src/api/common.ts` → `web/src/views/backend/user/user/popupForm.vue` |
| 当节产物 | CRUD 源码追踪结果 |

## 2. 本节目标

1. 能区分业务页面、通用表格组件、`baTable` 控制器、API 类和弹窗表单的职责。
2. 能沿着列表加载、新增、编辑、删除中的任意一条链路追踪数据和状态。
3. 能解释 BuildAdmin 为什么把 CRUD 公共流程集中到 `baTable`，以及业务页面仍需配置什么。
4. 能识别“数据状态”和“界面控制状态”，避免把整个 CRUD 简化成几个接口。

## 3. 开课诊断

请学生先根据现有经验回答三个问题，答案不要求使用术语：

1. 页面首次打开后，`baTable.getData()` 最终通过谁发出列表请求，结果又写到哪里？
2. 点击“编辑”时，为什么通常不能直接拿列表当前行作为完整编辑表单？
3. `index.vue` 已经创建了 `baTable`，`popupForm.vue` 为什么还能访问同一个实例？

诊断结果：

- 学生已理解列表请求面向服务端，响应数据会保存在 `baTable` 实例中。
- 待补知识一：尚不清楚为什么编辑表单通常需要按主键重新获取详情，而不是直接复用列表行。
- 待补知识二：尚不清楚页面与后代组件如何通过 `provide/inject` 共享同一个 `baTable` 实例。

## 4. 学习路线

1. 先建立 CRUD 五个角色的地图。
2. 追踪首次加载列表的完整链路。
3. 对照追踪新增、编辑、删除的状态变化。
4. 阅读 `provide/inject` 如何让页面、表格和表单共享控制器。
5. 完成一份源码追踪任务，并用自然语言解释其中一条链路。

## 5. 教学与互动记录

### 5.1 跳课说明

学生要求跳过第 17、18 节，直接开始第 19 节。第 17 节“路由守卫与权限入口”和第 18 节“请求错误与用户反馈”记为已跳过，不视为已经通过核心验收；以后遇到鉴权或错误反馈依赖时再按需补强。

### 5.2 开课诊断反馈

学生能判断请求发往服务端、响应数据进入 `baTable` 实例，但暂时不能解释编辑详情重取和 `provide/inject` 共享实例。这两点作为本节分段教学重点。

### 5.3 编辑详情为什么重新获取

学生已理解列表数据可能落后于服务端，编辑时应以服务端最新数据为准。需补充：数据过期通常来自其他用户或其他操作已修改服务器状态，并非网络本身导致；列表接口还可能为了轻量化只返回展示字段，缺少编辑表单需要的完整字段。因此 BuildAdmin 按主键调用编辑详情接口，再把 `res.data.row` 写入 `baTable.form.items`。

### 5.4 页面与表单共享控制器

学生已确认：如果 `PopupForm` 自己 `new baTableClass(...)`，得到的是新实例，不是 `index.vue` 创建的对象。正确方式是页面通过 `provide('baTable', baTable)` 提供实例，后代组件通过 `inject('baTable')` 获取同一对象，从而共享 `table`、`form` 等响应式状态和控制方法。

### 5.5 首次加载列表链路

学生已能正确追踪 `baTable.getData()` → `this.api.index(...)` → `table.data/table.total`。需继续区分 API 实例的创建表达式 `new baTableApi('/admin/user.User/')` 与该实例最终拼出的请求地址 `/admin/user.User/index`。

### 5.6 表格加载与表单加载

学生能正确判断翻页使用 `table.loading`，获取编辑详情使用 `form.loading`，并理解表格和表单是两个独立的界面区域。需补充：共用 loading 不一定导致表单绝对无法打开，但会使无关区域同时出现遮罩、转圈或禁用，无法准确表达当前等待的请求。

### 5.7 三种异步状态

学生已正确对应：`table.loading` 用于等待列表，`form.loading` 用于等待编辑详情，`form.submitLoading` 用于等待新增或编辑提交，并能区分三个阶段。

### 5.8 对象引用与新增默认值

学生：不太清楚

Coach：先暂时不看 BuildAdmin，只看普通 JavaScript。

```ts
const defaultItems = {
  status: 'enable',
}

const formItems = defaultItems
formItems.status = 'disable'

console.log(defaultItems.status)
```

最后输出的不是 `enable`，而是：

```text
disable
```

原因是对象赋值默认不会制造新对象：

```ts
const formItems = defaultItems
```

这句只是让 `formItems` 和 `defaultItems` 两个变量指向同一个对象。可以把对象想成一个房间，两个变量只是两把打开同一房间的钥匙。通过 `formItems` 修改房间里的状态，使用 `defaultItems` 再进去时看到的当然也是修改后的状态。

对应到错误的新增逻辑：

```ts
this.form.items = this.form.defaultItems
```

第一次打开表单后，两个属性指向同一个对象。用户把：

```ts
form.items.status = 'disable'
```

也就等于把：

```ts
form.defaultItems.status
```

改成了 `disable`。即使用户点击取消，默认值已经被污染，第二次打开时就不再是 `enable`。

`cloneDeep()` 会根据默认值创建一个内容相同、身份不同的新对象：

```ts
const formItems = cloneDeep(defaultItems)
formItems.status = 'disable'

console.log(formItems.status)    // disable
console.log(defaultItems.status) // enable
```

现在可以把它想成：按照样板重新建了一个房间。新房间里的东西可以修改，样板房不会跟着变化。

BuildAdmin 因此使用：

```ts
this.form.items = cloneDeep(this.form.defaultItems)
```

它保证每次点击新增，都从没有被上一次表单修改过的默认配置创建一份独立数据。

这里强调“深拷贝”，是因为默认值以后可能包含嵌套对象：

```ts
const defaultItems = {
  status: 'enable',
  profile: {
    city: '上海',
  },
}
```

浅拷贝虽然能复制最外层，但内部的 `profile` 仍可能共享；`cloneDeep()` 会继续复制嵌套对象。当前简单默认值用浅拷贝也可能工作，但通用 CRUD 控制器选择深拷贝更稳妥。

现在只判断一个现象：

```ts
const a = { status: 'enable' }
const b = a
b.status = 'disable'
```

此时 `a.status` 是 `enable` 还是 `disable`？为什么？

学生已正确回答 `disable`，原因是两个变量引用同一个对象。对象引用与深拷贝这一补强点通过。

### 5.9 删除后的状态同步

学生理解重新请求可以减少前端手工处理，但将问题初步表述为 `total` 与 `data` 数量不一致。需补强：`table.total` 是符合条件的全部记录数，`table.data.length` 是当前页行数，两者通常本就不相等；真正的问题是只删除本地行会让 `total`、分页和当前页数据继续反映删除前的服务端状态。重新调用 `getData()` 是为了让这些状态以服务端最终结果为准。

学生随后正确判断：服务端共有 34 条、每页 10 条时，第一页通常 `table.data.length` 为 10，`table.total` 为 34。分页状态概念通过。

## 6. 动手任务

本节为源码阅读课，不修改业务代码。学生在对话中完成用户列表、编辑详情、提交和删除刷新链路的逐段追踪，结果已归档在教学与互动记录及理解检查中。

## 7. 本节理解检查

进行中：最终检查要求学生解释一次编辑操作中业务页面、表格组件、`baTable` 控制器、`baTableApi` 和弹窗表单各自承担的职责，以及服务端数据最终写入的状态位置。

首次回答结果：学生已明确编辑详情写入 `form.items`，表单通过 `inject` 取得共享实例；仍需把“当前行”精确为控制器从当前行提取主键，把 `/edit` 补全为 `/admin/user.User/edit`，并重新说明保存后刷新列表的目的。

### 7.1 保存后刷新列表的纠错记录

Coach 提问：

> 编辑保存成功后，为什么还要调用 `getData()` 刷新列表？
>
> 可以想想：弹窗里的 `form.items` 更新了，表格使用的 `table.data` 会自动变成服务端保存后的最新列表吗？

学生回答：

> 刷新表格状态

Coach 纠错反馈：

> “刷新表格状态”方向没错，但还没有说清刷新的是哪些状态、为什么必须刷新。
>
> 保存时提交的是 `form.items`，表格显示的却是另一组状态 `table.data`；修改前者不会自动把后者替换为服务端保存后的最终数据。调用 `getData()` 会重新请求列表，把最新行写入 `table.data`，把最新总记录数写入 `table.total`。这样表格展示、分页和服务端最终状态才能重新一致。

Coach 最后检查：

> form.items 更新后，________ 不会自动更新，所以要调用 getData()。

学生回答：

> table.data

结果：回答正确，该补强点通过。

## 8. 验收结果

🟩 已通过。

- 能指出业务页面负责组装 API、列配置、默认值和子组件。
- 能追踪 `getData()` 经 `api.index(filter)` 请求 `/admin/user.User/index`，并将响应写入 `table.data/table.total`。
- 能解释编辑时按主键重取服务端完整详情，并写入 `form.items`。
- 能解释 `provide/inject` 共享同一个 `baTable` 实例，而不是创建副本。
- 能区分 `table.loading`、`form.loading`、`form.submitLoading`。
- 能解释新增使用 `cloneDeep(defaultItems)` 防止默认对象被污染。
- 能区分当前页行数 `table.data.length` 与全部记录数 `table.total`。
- 能解释提交和删除成功后重新请求列表，是为了让展示、分页与服务端最终状态一致。

## 9. 学习小结

BuildAdmin 的 CRUD 不是由单个组件完成，而是由业务页面、通用表格组件、`baTable` 控制器、`baTableApi` 和业务弹窗表单协作。控制器集中管理通用状态和流程，业务页面与表单保留模块差异；用户操作经控制器和 API 到达服务端，响应再写回响应式状态驱动界面更新。

本节补强点包括对象引用与深拷贝、API 实例与最终请求地址的区别，以及 `data.length` 与 `total` 的分页含义。以上均已在引导后通过检查。

## 10. 进度更新

第 19 节已完成。下一节为第 20 节“用户列表与分页”。第 17、18 节仍保持已跳过，未标记为已掌握。
