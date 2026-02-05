# 前端 API 使用文档

本文档说明前端如何调用后端 API。

## API 配置

### 配置文件
`app/lib/api.ts`

### API URL 配置逻辑

代码位置：`app/lib/api.ts`

```typescript
const getApiUrl = () => {
  // 如果设置了 VITE_API_URL，优先使用（适用于所有环境）
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 生产环境：如果没有设置，使用相对路径 /api
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // 开发环境：默认使用 localhost:3000
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();
```

**配置优先级：**
1. `VITE_API_URL` 环境变量（如果设置）
2. 生产环境：`/api`（相对路径）
3. 开发环境：`http://localhost:3000`（默认）

### 环境变量

在 Vite 项目中，环境变量需要放在 `.env` 文件中，并且必须以 `VITE_` 开头才能在前端代码中访问。

**创建 `.env` 文件：**

```bash
# zen-web/.env
VITE_API_URL=https://your-api-domain.com
```

**重要说明：**
- ✅ `.env` 文件**不需要 commit**（已被 `.gitignore` 忽略）
- ✅ Vite 在运行时（`npm run dev` 或 `npm run build`）**自动读取** `.env` 文件
- ✅ 修改 `.env` 文件后，**重启开发服务器**即可生效
- ✅ 环境变量必须以 `VITE_` 开头
- ✅ 在代码中通过 `import.meta.env.VITE_API_URL` 访问

**环境变量文件说明：**
- `.env` - 所有环境都会加载（不提交到 git）
- `.env.local` - 本地环境变量（会被 git 忽略，优先级最高）
- `.env.production` - 生产环境（`npm run build` 时使用）
- `.env.development` - 开发环境（`npm run dev` 时使用）

**工作原理：**
1. 在 `zen-web` 目录下创建 `.env` 文件
2. 添加 `VITE_API_URL=your-url`
3. 运行 `npm run dev` 时，Vite 自动读取 `.env` 文件
4. 代码中通过 `import.meta.env.VITE_API_URL` 访问
5. **不需要 commit**，`.env` 文件只存在于本地

## API 端点

### 1. 分类 (Categories)

#### 获取分类树
```typescript
GET /categories/tree
```

**使用位置：** `app/routes/home.tsx:47`

**请求示例：**
```typescript
const response = await fetch(`${API_URL}/categories/tree`);
const categoryTree = await response.json();
```

**响应格式：**
```typescript
interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
  createdAt: string;
}

// 返回数组
Category[]
```

**使用场景：**
- 页面加载时获取所有分类（树结构）
- 在添加句子对话框中选择分类

---

#### 创建分类
```typescript
POST /categories
```

**使用位置：** `app/components/AddSentenceDialog.tsx:143, 178`

**请求体：**
```typescript
{
  name: string;        // 分类名称（必需）
  parentId?: string;  // 父分类 ID（可选，用于创建子分类）
}
```

**请求示例：**
```typescript
const response = await fetch(`${API_URL}/categories`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Philosophy",
    // parentId: "optional-parent-id"
  }),
});

const newCategory = await response.json();
```

**响应格式：**
```typescript
{
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}
```

**使用场景：**
- 在添加句子对话框中创建新分类
- 用户输入新分类名时自动创建

---

#### 删除分类
```typescript
DELETE /categories/:id
```

**注意：** 前端目前未实现删除分类功能，但后端已支持。

**请求示例：**
```typescript
const response = await fetch(`${API_URL}/categories/${categoryId}`, {
  method: "DELETE",
});
```

**响应格式：**
```typescript
{
  message: "Category deleted successfully";
}
```

---

### 2. 句子 (Sentences)

#### 获取所有句子
```typescript
GET /sentences
```

**使用位置：** `app/routes/home.tsx:46`

**请求示例：**
```typescript
const response = await fetch(`${API_URL}/sentences`);
const sentences = await response.json();
```

**响应格式：**
```typescript
interface ApiSentence {
  id: string;
  content: string;
  bookName: string | null;
  categories: {
    id: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// 返回数组
ApiSentence[]
```

**前端数据转换：**
```typescript
// 在 home.tsx 中转换为前端格式
const sentences: Sentence[] = apiSentences.map((s) => ({
  id: s.id,
  text: s.content,
  categoryIds: s.categories.map(c => c.id),
  categoryNames: s.categories.map(c => c.name),
  createdAt: new Date(s.createdAt).getTime(),
}));
```

**使用场景：**
- 页面加载时获取所有句子
- 删除或创建句子后重新加载数据

---

#### 创建句子
```typescript
POST /sentences
```

**使用位置：** `app/routes/home.tsx:120`

**请求体：**
```typescript
{
  content: string;           // 句子内容（必需）
  categoryIds: string[];     // 分类 ID 数组（必需，至少一个）
  bookName?: string;         // 书名（可选）
}
```

**请求示例：**
```typescript
const response = await fetch(`${API_URL}/sentences`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content: "Nothing is so repulsive as a sentimentalist in a dry season.",
    categoryIds: ["category-id-1", "category-id-2"], // 支持多分类
    bookName: "The Picture of Dorian Gray", // 可选
  }),
});
```

**响应格式：**
```typescript
{
  id: string;
  content: string;
  bookName: string | null;
  categories: {
    id: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
```

**使用场景：**
- 用户在添加句子对话框中提交新句子
- 支持多分类选择

---

#### 删除句子
```typescript
DELETE /sentences/:id
```

**使用位置：** `app/routes/home.tsx:150`

**请求示例：**
```typescript
const response = await fetch(`${API_URL}/sentences/${sentenceId}`, {
  method: "DELETE",
});
```

**响应格式：**
```typescript
{
  message: "Sentence deleted successfully";
}
```

**使用场景：**
- 用户点击删除按钮删除句子
- 删除前会显示确认对话框

---

### 3. 搜索 (Search)

**注意：** 前端目前**未使用**后端搜索 API，搜索在前端本地完成。

后端提供的搜索端点（未来可用）：

#### 搜索分类
```typescript
GET /search/categories?q=query
```

**响应格式：**
```typescript
{
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}[]
```

#### 搜索句子
```typescript
GET /search/sentences?q=query
```

**响应格式：**
```typescript
ApiSentence[]  // 与 GET /sentences 格式相同
```

#### 综合搜索
```typescript
GET /search?q=query
```

**响应格式：**
```typescript
{
  categories: Category[];
  sentences: ApiSentence[];
  total: number;
}
```

---

## 错误处理

### 当前实现

前端使用简单的错误处理：

```typescript
try {
  const response = await fetch(`${API_URL}/endpoint`, options);
  
  if (!response.ok) {
    throw new Error("Failed to ...");
  }
  
  const data = await response.json();
} catch (error) {
  console.error("Error:", error);
  alert("Failed to ... Please try again.");
}
```

### 错误响应格式

后端返回的错误格式：

```typescript
{
  statusCode: number;
  message: string;
  error?: string;
}
```

**常见状态码：**
- `400` - 请求参数错误
- `404` - 资源未找到
- `500` - 服务器内部错误

---

## 数据刷新

### 使用 React Router 的 revalidator

在创建或删除数据后，使用 `revalidator.revalidate()` 重新加载数据：

```typescript
import { useRevalidator } from 'react-router';

const revalidator = useRevalidator();

// 创建或删除后
revalidator.revalidate();
```

**使用位置：**
- `home.tsx:137` - 创建句子后
- `home.tsx:159` - 删除句子后
- `AddSentenceDialog.tsx:196` - 创建分类后（通过回调）

---

## 数据格式转换

### 后端 → 前端

**句子数据转换：**
```typescript
// 后端格式
{
  id: string;
  content: string;
  categories: { id: string; name: string }[];
  createdAt: string;
}

// 前端格式
{
  id: string;
  text: string;  // content → text
  categoryIds: string[];
  categoryNames: string[];
  createdAt: number;  // ISO string → timestamp
}
```

**分类数据：**
- 分类树格式直接使用，无需转换

---

## 最佳实践

### 1. API 调用模式

当前前端使用直接 `fetch` 调用，建议：

- ✅ 保持简单：对于小型项目，直接使用 `fetch` 足够
- 🔄 未来可考虑：使用 `apiFetch` 辅助函数统一错误处理

### 2. 错误处理

当前使用 `alert`，建议：

- ✅ 开发阶段：`alert` 足够
- 🔄 生产环境：考虑使用 toast 通知或错误边界

### 3. 加载状态

当前未实现加载状态，建议：

- 🔄 添加 loading 状态提升用户体验
- 🔄 使用 React Suspense 处理异步加载

### 4. 搜索功能

当前前端本地搜索，建议：

- ✅ 数据量小：前端搜索足够
- 🔄 数据量大：考虑使用后端搜索 API

---

## 完整示例

### 创建句子（完整流程）

```typescript
// 1. 用户输入句子和选择分类
const text = "Your sentence here";
const categoryIds = ["category-id-1", "category-id-2"];

// 2. 调用 API
try {
  const response = await fetch(`${API_URL}/sentences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: text,
      categoryIds: categoryIds,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create sentence");
  }

  // 3. 刷新数据
  revalidator.revalidate();
  
  // 4. 关闭对话框
  setAddDialogOpen(false);
} catch (error) {
  console.error("Error adding sentence:", error);
  alert("Failed to add sentence. Please try again.");
}
```

---

## 相关文件

- **API 配置：** `app/lib/api.ts`
- **主页面：** `app/routes/home.tsx`
- **添加对话框：** `app/components/AddSentenceDialog.tsx`
- **数据模型：** `app/lib/storage.ts`

---

## 更新日志

- 2026-02-05: 初始文档
- 支持多分类功能
- 添加搜索 API 说明（未使用）
