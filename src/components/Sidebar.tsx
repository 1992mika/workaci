import { useFlowStore, NODE_TEMPLATES } from '../store/useFlowStore'
import { useDragDrop } from '../hooks/useDragDrop'

/** 侧边栏 —— 节点模板面板，拖拽到画布上创建节点 */
export default function Sidebar() {
  const { onDragStart } = useDragDrop()
  const nodeCount = useFlowStore((s) => s.nodes.length)
  const edgeCount = useFlowStore((s) => s.edges.length)

  return (
    <aside className="rf-sidebar">
      <div className="rf-sidebar-section">
        <div className="rf-sidebar-title">节点面板</div>
        <div className="rf-sidebar-hint">拖拽节点到右侧画布</div>
        <div className="rf-node-palette">
          {NODE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.type}
              className="rf-palette-item"
              draggable
              onDragStart={(e) => onDragStart(e, tpl.type)}
              style={{ borderLeftColor: tpl.color }}
            >
              <span className="rf-palette-icon" style={{ color: tpl.color }}>
                {tpl.icon}
              </span>
              <div className="rf-palette-info">
                <div className="rf-palette-label">{tpl.label}</div>
                <div className="rf-palette-desc">{tpl.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rf-sidebar-section">
        <div className="rf-sidebar-title">统计</div>
        <div className="rf-stats">
          <div className="rf-stat-item">
            <span className="rf-stat-num">{nodeCount}</span>
            <span className="rf-stat-label">节点</span>
          </div>
          <div className="rf-stat-item">
            <span className="rf-stat-num">{edgeCount}</span>
            <span className="rf-stat-label">连线</span>
          </div>
        </div>
      </div>

      <div className="rf-sidebar-section">
        <div className="rf-sidebar-title">操作说明</div>
        <ul className="rf-help-list">
          <li><b>拖拽</b>侧边栏节点到画布创建</li>
          <li><b>拖拽</b>节点底部圆点连线</li>
          <li><b>点击</b>节点查看详情</li>
          <li><b>Delete</b> 键删除选中项</li>
          <li><b>滚轮</b>缩放 · <b>拖拽空白</b>平移</li>
        </ul>
      </div>
    </aside>
  )
}
