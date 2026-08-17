import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useFlowStore } from '../store/useFlowStore'
import { useDragDrop } from '../hooks/useDragDrop'
import BaseNode from './nodes/BaseNode'
import CustomEdge from './edges/CustomEdge'
import type { AppNodeData, AppEdge } from '../types'

const nodeTypes: NodeTypes = {
  input: BaseNode,
  process: BaseNode,
  decision: BaseNode,
  output: BaseNode,
}

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
}

const NODE_COLORS: Record<string, string> = {
  input: '#3b82f6',
  process: '#8b5cf6',
  decision: '#f59e0b',
  output: '#10b981',
}

export default function CanvasFlow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setSelectedEdge,
    deleteNode,
    deleteEdge,
  } = useFlowStore()

  const { onDragOver, onDrop } = useDragDrop()

  const onNodeClick = useCallback(
    (_e: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id)
    },
    [setSelectedNode]
  )

  const onEdgeClick = useCallback(
    (_e: React.MouseEvent, edge: { id: string }) => {
      setSelectedEdge(edge.id)
    },
    [setSelectedEdge]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [setSelectedNode, setSelectedEdge])

  const onDelete = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const state = useFlowStore.getState()
      if (state.selectedNodeId) {
        deleteNode(state.selectedNodeId)
      } else if (state.selectedEdgeId) {
        deleteEdge(state.selectedEdgeId)
      }
    },
    [deleteNode, deleteEdge]
  )

  return (
    <div
      className="rf-canvas-wrapper"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onDelete}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="var(--minimap-dot, rgba(255,255,255,0.06))"
        />
        <Controls
          className="rf-controls"
          showInteractive={false}
        />
        <MiniMap
          className="rf-minimap"
          pannable
          zoomable
          nodeColor={(n) => {
            const data = n.data as AppNodeData
            return NODE_COLORS[data?.nodeType] ?? '#64748b'
          }}
          maskColor="var(--minimap-mask, rgba(0,0,0,0.5))"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
          }}
        />
      </ReactFlow>
    </div>
  )
}

export type { AppEdge }
