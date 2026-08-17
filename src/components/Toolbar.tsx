import { useFlowStore } from '../store/useFlowStore'

export default function Toolbar() {
  const { clearAll, loadSample, nodes, edges } = useFlowStore()

  return (
    <header className="rf-toolbar">
      <div className="rf-toolbar-left">
        <div className="rf-logo">
          <span className="rf-logo-icon">⬡</span>
          <span className="rf-logo-text">Canvas Engine</span>
        </div>
        <span className="rf-toolbar-badge">ReactFlow</span>
      </div>

      <div className="rf-toolbar-right">
        <button className="rf-btn rf-btn-ghost" onClick={loadSample}>
          加载示例
        </button>
        <button
          className="rf-btn rf-btn-ghost"
          onClick={() => {
            const data = JSON.stringify({ nodes, edges }, null, 2)
            navigator.clipboard?.writeText(data)
          }}
        >
          复制 JSON
        </button>
        <button
          className="rf-btn rf-btn-danger-ghost"
          onClick={() => {
            if (window.confirm('确认清空画布？')) clearAll()
          }}
        >
          清空
        </button>
      </div>
    </header>
  )
}
