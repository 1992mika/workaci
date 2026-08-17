import type { Node, Edge } from '@xyflow/react'

/** 节点类型枚举 */
export type NodeType = 'input' | 'process' | 'output' | 'decision'

/** 自定义节点数据结构 */
export interface AppNodeData extends Record<string, unknown> {
  label: string
  description: string
  nodeType: NodeType
  status: 'idle' | 'running' | 'success' | 'error'
  /** 判断节点的规则列表（每个规则对应一个连出点） */
  rules?: string[]
  config?: Record<string, unknown>
}

/** 项目中的节点类型 */
export type AppNode = Node<AppNodeData>
/** 项目中的边类型 */
export type AppEdge = Edge<{ label?: string; condition?: string }>

/** 侧边栏可拖拽的节点模板 */
export interface NodeTemplate {
  type: NodeType
  label: string
  icon: string
  color: string
  description: string
}
