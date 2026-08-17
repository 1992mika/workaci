import { useCallback, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useFlowStore, genNodeId } from '../store/useFlowStore'
import { NODE_TEMPLATES } from '../store/useFlowStore'
import type { AppNode, NodeType } from '../types'

/**
 * 拖拽创建节点的 Hook
 * - onDragStart: 在侧边栏模板上触发，设置 dataTransfer
 * - onDragOver: 在画布上阻止默认行为以允许 drop
 * - onDrop: 在画布上释放时，根据屏幕坐标计算画布坐标并创建节点
 */
export function useDragDrop() {
  const { screenToFlowPosition } = useReactFlow()
  const addNode = useFlowStore((s) => s.addNode)
  const dragTypeRef = useRef<NodeType | null>(null)

  const onDragStart = useCallback((event: React.DragEvent, type: NodeType) => {
    dragTypeRef.current = type
    event.dataTransfer.setData('application/reactflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow') as NodeType
      if (!type) return

      const template = NODE_TEMPLATES.find((t) => t.type === type)
      if (!template) return

      // 屏幕坐标 → 画布坐标
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

      const newNode: AppNode = {
        id: genNodeId(),
        type: template.type,
        position,
        data: {
          label: template.label,
          description: template.description,
          nodeType: template.type,
          status: 'idle',
          // 判断节点默认带两个规则
          ...(template.type === 'decision' ? { rules: ['是', '否'] } : {}),
        },
      }

      addNode(newNode)
    },
    [screenToFlowPosition, addNode]
  )

  return { onDragStart, onDragOver, onDrop }
}
