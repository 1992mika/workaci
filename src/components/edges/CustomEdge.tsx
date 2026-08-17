import { memo, useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'

function CustomEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  label,
  selected,
  animated,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false)

  // 贝塞尔曲线：平滑弯曲，无直角
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const isHighlighted = selected || hovered

  return (
    <>
      {/* 可见连线 */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isHighlighted ? '#60a5fa' : 'rgba(148,163,184,0.5)',
          strokeWidth: isHighlighted ? 2.5 : 1.5,
          ...style,
        }}
      />
      {/* 透明加宽的交互区域 */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'none',
            opacity: label || isHighlighted ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
          className="rf-edge-label-pill"
        >
          {label || (isHighlighted ? '双击删除' : '')}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(CustomEdgeComponent)
