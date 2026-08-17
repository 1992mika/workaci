import { useState, useEffect } from 'react'
import { useFlowStore } from '../store/useFlowStore'
import type { AppNodeData } from '../types'

const STATUS_OPTIONS = [
  { value: 'idle', label: '空闲', color: '#64748b' },
  { value: 'running', label: '运行中', color: '#3b82f6' },
  { value: 'success', label: '成功', color: '#10b981' },
  { value: 'error', label: '错误', color: '#ef4444' },
] as const

const TYPE_LABELS: Record<string, string> = {
  input: '输入节点',
  process: '处理节点',
  decision: '判断节点',
  output: '输出节点',
}

export default function DetailPanel() {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    updateNodeData,
    deleteNode,
    deleteEdge,
    setSelectedNode,
    setSelectedEdge,
  } = useFlowStore()

  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<AppNodeData['status']>('idle')
  const [rulesText, setRulesText] = useState('')

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId)

  // 选中节点变化时同步表单
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label)
      setDescription(selectedNode.data.description)
      setStatus(selectedNode.data.status)
      setRulesText((selectedNode.data.rules ?? []).join('，'))
    }
  }, [selectedNodeId])

  const saveRules = () => {
    if (!selectedNodeId || selectedNode?.data.nodeType !== 'decision') return
    const rules = rulesText
      .split(/[，,、\n]/)
      .map((r) => r.trim())
      .filter(Boolean)
    updateNodeData(selectedNodeId, { rules })
  }

  // 找到与当前节点关联的连线
  const relatedEdges = selectedNode
    ? edges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    : []

  const handleSave = () => {
    if (!selectedNodeId) return
    updateNodeData(selectedNodeId, { label, description, status })
  }

  // --- 边详情面板 ---
  if (selectedEdge) {
  const sourceNode = nodes.find((n) => n.id === selectedEdge.source)
  const targetNode = nodes.find((n) => n.id === selectedEdge.target)

  return (
    <div className="rf-detail-panel">
      <div className="rf-detail-header">
        <span className="rf-detail-badge" style={{ background: '#06b6d422', color: '#06b6d4' }}>连线</span>
        <span className="rf-detail-id">ID: {selectedEdge.id}</span>
        <button className="rf-detail-close" onClick={() => setSelectedEdge(null)}>✕</button>
      </div>

      <div className="rf-detail-body">
        <div className="rf-field-group">
          <label>来源节点</label>
          <div className="rf-field-value">{sourceNode?.data.label || '—'}</div>
        </div>
        <div className="rf-field-group">
          <label>目标节点</label>
          <div className="rf-field-value">{targetNode?.data.label || '—'}</div>
        </div>
        <div className="rf-field-group">
          <label>连线标签</label>
          <div className="rf-field-value">{selectedEdge.label || '（无标签）'}</div>
        </div>
        <div className="rf-field-group">
          <label>动画</label>
          <div className="rf-field-value">{selectedEdge.animated ? '是' : '否'}</div>
        </div>
      </div>

      <button
        className="rf-btn rf-btn-danger"
        onClick={() => deleteEdge(selectedEdge.id)}
      >
        删除连线
      </button>
    </div>
  )
  }

  // --- 节点详情面板 ---
  if (selectedNode) {
  const data = selectedNode.data as AppNodeData

  return (
    <div className="rf-detail-panel">
      <div className="rf-detail-header">
        <span
          className="rf-detail-badge"
          style={{ background: `${data.nodeType === 'input' ? '#3b82f6' : data.nodeType === 'process' ? '#8b5cf6' : data.nodeType === 'decision' ? '#f59e0b' : '#10b981'}22` }}
        >
          {TYPE_LABELS[data.nodeType] || '节点'}
        </span>
        <span className="rf-detail-id">ID: {selectedNode.id}</span>
        <button className="rf-detail-close" onClick={() => setSelectedNode(null)}>✕</button>
      </div>

      <div className="rf-detail-body">
        <div className="rf-field-group">
          <label>节点名称</label>
          <input
            className="rf-input"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleSave}
          />
        </div>

        <div className="rf-field-group">
          <label>描述</label>
          <textarea
            className="rf-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
          />
        </div>

        <div className="rf-field-group">
          <label>运行状态</label>
          <div className="rf-status-selector">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`rf-status-btn ${status === opt.value ? 'active' : ''}`}
                style={status === opt.value ? { borderColor: opt.color, color: opt.color, background: `${opt.color}15` } : {}}
                onClick={() => {
                  setStatus(opt.value)
                  updateNodeData(selectedNode.id, { status: opt.value })
                }}
              >
                <span className="rf-status-dot" style={{ '--dot': opt.color } as React.CSSProperties} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {data.nodeType === 'decision' && (
          <div className="rf-field-group">
            <label>规则列表（每行一个，每个规则一个连线点）</label>
            <textarea
              className="rf-textarea"
              rows={4}
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              onBlur={saveRules}
              placeholder={'条件成立\n条件不成立\n其他'}
            />
          </div>
        )}

        <div className="rf-field-group">
          <label>位置坐标</label>
          <div className="rf-field-value mono">
            x: {Math.round(selectedNode.position.x)}, y: {Math.round(selectedNode.position.y)}
          </div>
        </div>

        <div className="rf-field-group">
          <label>关联连线 ({relatedEdges.length})</label>
          <div className="rf-edge-list">
            {relatedEdges.length === 0 && <div className="rf-empty">暂无连线</div>}
            {relatedEdges.map((e) => {
              const isSource = e.source === selectedNode.id
              const otherId = isSource ? e.target : e.source
              const otherNode = nodes.find((n) => n.id === otherId)
              return (
                <div key={e.id} className="rf-edge-item" onClick={() => setSelectedEdge(e.id)}>
                  <span className="rf-edge-dir">{isSource ? '→' : '←'}</span>
                  <span className="rf-edge-name">{otherNode?.data.label || '?'}</span>
                  {e.label && <span className="rf-edge-tag">{e.label}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <button
        className="rf-btn rf-btn-danger"
        onClick={() => deleteNode(selectedNode.id)}
      >
        删除节点
      </button>
    </div>
  )
  }

  // --- 空状态 ---
  return (
    <div className="rf-detail-panel rf-detail-empty">
      <div className="rf-empty-icon">◇</div>
      <div className="rf-empty-title">未选中任何元素</div>
      <div className="rf-empty-desc">点击画布中的节点或连线查看详情</div>
    </div>
  )
}
