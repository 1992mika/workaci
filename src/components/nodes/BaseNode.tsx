import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { AppNodeData, NodeType } from '../../types'

/** 节点类型样式映射 */
const TYPE_STYLES: Record<NodeType, { color: string; icon: string; label: string }> = {
  input: { color: '#3b82f6', icon: '▶', label: '输入' },
  process: { color: '#8b5cf6', icon: '⚙', label: '处理' },
  decision: { color: '#f59e0b', icon: '◆', label: '判断' },
  output: { color: '#10b981', icon: '◉', label: '输出' },
}

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  idle: { dot: '#64748b', text: '空闲' },
  running: { dot: '#3b82f6', text: '运行中' },
  success: { dot: '#10b981', text: '成功' },
  error: { dot: '#ef4444', text: '错误' },
}

function BaseNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as AppNodeData
  const style = TYPE_STYLES[nodeData.nodeType] ?? TYPE_STYLES.process
  const status = STATUS_STYLES[nodeData.status] ?? STATUS_STYLES.idle
  const type = nodeData.nodeType
  const rules = nodeData.rules ?? []

  // 头部左侧连入点：处理 / 判断 / 输出（输入没有，只能连出）
  const hasHeaderTarget = type !== 'input'
  // 头部右侧连出点：输入 / 处理（输出没有，只能连入）
  const hasHeaderSource = type === 'input' || type === 'process'

  return (
    <div
      className="rf-custom-node"
      style={
        {
          '--node-color': style.color,
          borderColor: selected ? style.color : 'rgba(255,255,255,0.12)',
          boxShadow: selected
            ? `0 0 0 2px ${style.color}40, 0 4px 20px rgba(0,0,0,0.4)`
            : '0 2px 12px rgba(0,0,0,0.3)',
        } as React.CSSProperties
      }
    >
      {/* 头部行：连入点在左侧、连出点在右侧，手柄固定在头部 */}
      <div className="rf-node-header" style={{ background: `${style.color}22`, borderBottom: `1px solid ${style.color}33` }}>
        {hasHeaderTarget && (
          <Handle type="target" id="in" position={Position.Left} />
        )}
        <span className="rf-node-icon" style={{ color: style.color }}>{style.icon}</span>
        <span className="rf-node-type-tag" style={{ color: style.color }}>{style.label}</span>
        <span
          className="rf-node-status"
          style={{ '--dot': status.dot } as React.CSSProperties}
        >
          <span className="rf-status-dot" />
          {status.text}
        </span>
        {hasHeaderSource && (
          <Handle type="source" id="out" position={Position.Right} />
        )}
      </div>

      {/* 节点内容 */}
      <div className="rf-node-body">
        <div className="rf-node-label">{nodeData.label}</div>
        {nodeData.description && (
          <div className="rf-node-desc">{nodeData.description}</div>
        )}

        {/* 判断节点：规则列表，每个规则项右侧一个连出点 */}
        {type === 'decision' && rules.length > 0 && (
          <div className="rf-rule-list">
            {rules.map((rule, i) => (
              <div key={i} className="rf-rule-item">
                <span className="rf-rule-dot" style={{ background: style.color }} />
                <span className="rf-rule-name">{rule}</span>
                <Handle
                  type="source"
                  id={`rule-${i}`}
                  position={Position.Right}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(BaseNodeComponent)
