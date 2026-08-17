# ReactFlow 画布引擎项目指南

面向 AI 代理与开发者的项目说明。修改代码前请先阅读本文件，特别是「关键约定与坑」一节。

## 项目概述

基于 **@xyflow/react (ReactFlow v12)** 的可视化画布引擎前端项目，实现节点创建、连线、拖拽、详情编辑等核心交互能力。

- 类型：纯前端静态应用（Vite 构建，无后端依赖）
- 状态：zustand 全局状态管理（节点/边/选中态）
- 主题：深色玻璃拟态风格

## 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| react / react-dom | ^18.3 | UI 框架 |
| @xyflow/react | ^12.3 | 画布引擎（节点/边/手柄/控件） |
| zustand | ^4.5 | 轻量全局状态 |
| vite | ^5.4 | 构建工具 |
| typescript | ^5.6 | 类型检查 |

## 常用命令

```bash
npm run dev      # 启动开发服务器（默认 http://localhost:5173）
npm run build    # 类型检查 + 生产构建（tsc -b && vite build，产物在 dist/）
npm run preview  # 预览生产构建
```

## 目录结构

```
src/
├── main.tsx                     # 应用入口
├── App.tsx                      # 布局：Sidebar + CanvasFlow + DetailPanel + Toolbar
├── types/index.ts               # 核心类型：AppNodeData / AppNode / AppEdge / NodeTemplate
├── store/
│   └── useFlowStore.ts          # zustand 全局状态 + 初始示例数据 + NODE_TEMPLATES 模板表
├── hooks/
│   └── useDragDrop.ts           # 侧边栏拖拽 → 画布创建节点（screenToFlowPosition 坐标转换）
├── components/
│   ├── CanvasFlow.tsx           # 画布主体：注册 nodeTypes/edgeTypes、交互事件、Background/Controls/MiniMap
│   ├── Sidebar.tsx              # 左侧节点模板面板（拖拽源）
│   ├── Toolbar.tsx              # 顶部工具栏（加载示例/复制 JSON/清空）
│   ├── DetailPanel.tsx          # 右侧详情面板（节点编辑 + 判断节点规则编辑 + 边信息）
│   ├── nodes/
│   │   └── BaseNode.tsx         # 自定义节点组件（4 类节点统一渲染，含规则列表手柄）
│   └── edges/
│       └── CustomEdge.tsx       # 自定义连线（贝塞尔曲线 + hover 高亮 + 标签）
└── styles/
    └── index.css                # 全局深色主题 + ReactFlow 覆盖样式
```

## 核心架构

### 数据模型（`src/types/index.ts`）

```ts
type NodeType = 'input' | 'process' | 'output' | 'decision'

interface AppNodeData {
  label: string
  description: string
  nodeType: NodeType
  status: 'idle' | 'running' | 'success' | 'error'
  rules?: string[]            // 仅判断节点：每个规则对应一个连出点
  config?: Record<string, unknown>
}
```

- `AppNode = Node<AppNodeData>`，`AppEdge = Edge<{ label?: string; condition?: string }>`
- 节点 `type` 字段与 `data.nodeType` 字段**保持一致**（二者冗余，渲染以 `data.nodeType` 为准）

### 状态管理（`src/store/useFlowStore.ts`）

- 唯一全局 store，持有 `nodes / edges / selectedNodeId / selectedEdgeId`
- 节点/边的增删改全部走 store action（`addNode / updateNodeData / deleteNode / deleteEdge` 等）
- `deleteNode` 会级联删除所有相连边；节点与边选中态互斥（`setSelectedNode` 会清空 edge 选中）
- 新节点 id 用 `genNodeId()` 生成（`node_101` 递增）；新边 id 用 `edge_${Date.now()}`
- 新增节点类型时需同步维护 `NODE_TEMPLATES` 模板表（侧边栏拖拽来源）

### 节点渲染（`BaseNode.tsx`）

4 类节点共用一个 `BaseNode` 组件，通过 `data.nodeType` 分支渲染，类型样式见 `TYPE_STYLES`（颜色/图标/名称）。

**端口（Handle）设计规范 —— 左右方向布局：**

| 节点类型 | 连入 target | 连出 source | 位置 |
|---------|------------|------------|------|
| input | 无 | `out` | header 右侧 |
| process | `in` | `out` | header 左侧 / header 右侧 |
| output | `in` | 无 | header 左侧 |
| decision | `in` | `rule-${i}`（每个规则一个） | header 左侧 / 规则项右侧 |

实现要点：
- 手柄放在 `position: relative` 的 header 行 / 规则项内部，自动相对父元素边缘垂直居中，**无需硬编码坐标**
- 手柄必须有**唯一 id**（如 `in` / `out` / `rule-0`），否则多手柄节点连线时会串端口
- 手柄颜色跟随节点类型：节点根元素设置 CSS 变量 `--node-color`，样式表用 `background: var(--node-color)` 绑定

### 连线（`CustomEdge.tsx`）

- 使用 `getBezierPath` 生成**平滑贝塞尔曲线**（用户明确要求：不要直角折线）
- 透明加宽（strokeWidth 24）交互热区，hover/选中高亮
- 标签渲染在 `EdgeLabelRenderer` 中，未选中且无标签时隐藏

### 交互事件（`CanvasFlow.tsx`）

- 点击节点/边 → 设置对应选中态 → 右侧详情面板联动
- 点击空白（`onPaneClick`）→ 清除选中
- Delete / Backspace → 删除选中的节点或边
- `ConnectionMode.Loose`：连线自动匹配最近端口；拖拽节点自动带起相连边

## 关键约定与坑（务必遵守）

1. **节点根元素不要用 `overflow: hidden`**
   - 之前因 `overflow: hidden` + 手柄定位覆盖，导致手柄被整体裁剪、完全无法拖线。
   - 圆角观感改用节点头/体的独立 `border-radius` 实现（`9px 9px 0 0` / `0 0 9px 9px`）。

2. **不要覆盖 ReactFlow 手柄的 position/transform**
   - 库默认 `top: 0 + translate(-50%,-50%)`（手柄一半在节点内、一半在外）。
   - 覆盖 `top: -5px` 之类的定位会把手柄推出节点边界；hover 时改 `transform` 会破坏居中。hover 反馈用 `box-shadow` 光晕即可。

3. **`input` / `output` 是 ReactFlow 内置保留节点类型名**
   - 使用它们会自动套用库默认样式（白底 + padding + 边框），已在 `styles/index.css` 中用 `.react-flow__node-input, .react-flow__node-output` 覆盖为透明无 padding。
   - **新增节点类型时尽量用自定义名称**（如 `data-input`、`data-output`），避免触发内置样式。

4. **`data.nodeType` 与节点 `type` 字段必须同步**，新增类型时两处都要维护，且 `CanvasFlow.tsx` 的 `nodeTypes` 注册表、`NODE_TEMPLATES`、`NODE_COLORS`、`TYPE_STYLES` 四张表都要加。

5. **样式集中在 `styles/index.css`**，画布/手柄/节点均为深色主题；所有颜色类（如节点边框）优先通过 `--node-color` 变量注入，避免硬编码。

6. **判断节点的规则编辑在详情面板**：textarea 逗号/换行分隔，失焦保存为 `rules: string[]`；规则增删后对应手柄 `rule-${i}` 会自动增减，但**已存在的连线不会自动重建**，若规则顺序/数量变化导致端口错位，需手动重连。

## 验证方式

```bash
npx tsc -b            # 类型检查（必须通过）
npm run build         # 生产构建
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/   # dev server 可用性
```

无头浏览器实测（可选）：项目根目录装有 `playwright-core`（--no-save），可连接系统 Chrome 验证手柄位置与拖拽连线。
