import { create } from 'zustand'
import {
  addEdge as rfAddEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from '@xyflow/react'
import type { AppNode, AppEdge, NodeType } from '../types'

let nodeIdCounter = 100

export function genNodeId(): string {
  nodeIdCounter += 1
  return `node_${nodeIdCounter}`
}

interface FlowState {
  nodes: AppNode[]
  edges: AppEdge[]
  selectedNodeId: string | null
  selectedEdgeId: string | null

  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect

  addNode: (node: AppNode) => void
  updateNodeData: (id: string, data: Partial<AppNode['data']>) => void
  deleteNode: (id: string) => void
  deleteEdge: (id: string) => void
  setSelectedNode: (id: string | null) => void
  setSelectedEdge: (id: string | null) => void
  clearAll: () => void
  loadSample: () => void
}

const initialNodes: AppNode[] = [
  {
    id: 'node_1',
    type: 'input',
    position: { x: 80, y: 180 },
    data: {
      label: '数据输入',
      description: '接收上游数据源',
      nodeType: 'input',
      status: 'success',
    },
  },
  {
    id: 'node_2',
    type: 'process',
    position: { x: 380, y: 120 },
    data: {
      label: '数据清洗',
      description: '过滤空值、去重、格式化',
      nodeType: 'process',
      status: 'running',
    },
  },
  {
    id: 'node_3',
    type: 'decision',
    position: { x: 380, y: 300 },
    data: {
      label: '条件判断',
      description: '判断数据是否符合规则',
      nodeType: 'decision',
      status: 'idle',
      rules: ['条件成立', '条件不成立', '其他'],
    },
  },
  {
    id: 'node_4',
    type: 'output',
    position: { x: 680, y: 180 },
    data: {
      label: '结果输出',
      description: '输出处理后的数据',
      nodeType: 'output',
      status: 'idle',
    },
  },
]

const initialEdges: AppEdge[] = [
  {
    id: 'edge_1',
    source: 'node_1',
    target: 'node_2',
    animated: true,
    label: '原始数据',
  },
  {
    id: 'edge_2',
    source: 'node_1',
    target: 'node_3',
    label: '校验',
  },
  {
    id: 'edge_3',
    source: 'node_2',
    target: 'node_4',
    label: '清洗后',
    animated: true,
  },
]

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  selectedEdgeId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as AppNode[] })
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as AppEdge[] })
  },
  onConnect: (connection: Connection) => {
    const newEdge: AppEdge = {
      ...connection,
      id: `edge_${Date.now()}`,
      animated: false,
    }
    set({
      edges: rfAddEdge({ ...newEdge, ...connection }, get().edges) as AppEdge[],
    })
  },

  addNode: (node) => {
    set((state) => ({ nodes: [...state.nodes, node] }))
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }))
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }))
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    }))
  },

  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  clearAll: () =>
    set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null }),

  loadSample: () =>
    set({
      nodes: initialNodes,
      edges: initialEdges,
      selectedNodeId: null,
      selectedEdgeId: null,
    }),
}))

/** 节点类型配置表 */
export const NODE_TEMPLATES: { type: NodeType; label: string; icon: string; color: string; description: string }[] = [
  { type: 'input', label: '输入节点', icon: '▶', color: '#3b82f6', description: '数据输入源' },
  { type: 'process', label: '处理节点', icon: '⚙', color: '#8b5cf6', description: '数据处理/转换' },
  { type: 'decision', label: '判断节点', icon: '◆', color: '#f59e0b', description: '条件分支判断' },
  { type: 'output', label: '输出节点', icon: '◉', color: '#10b981', description: '结果输出' },
]
