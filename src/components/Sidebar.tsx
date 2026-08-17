import { useFlowStore, NODE_TEMPLATES } from '../store/useFlowStore'
import { useDragDrop } from '../hooks/useDragDrop'
import { useTheme, type AccentName } from '../hooks/useTheme'

const ACCENT_LABELS: Record<AccentName, string> = {
  emerald: '翡翠',
  ocean: '静海',
  iris: '鸢尾',
  amber: '琥珀',
  sakura: '绯樱',
}

/** 侧边栏 —— 节点模板面板（极光卡片），拖拽到画布上创建节点；底部主题/强调色切换 */
export default function Sidebar() {
  const { onDragStart } = useDragDrop()
  const nodeCount = useFlowStore((s) => s.nodes.length)
  const edgeCount = useFlowStore((s) => s.edges.length)
  const { theme, accent, toggleTheme, setAccent, accents } = useTheme()

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
              style={
                {
                  '--palette-a': tpl.aurora.a,
                  '--palette-b': tpl.aurora.b,
                  '--palette-c': tpl.aurora.c,
                } as React.CSSProperties
              }
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

      {/* 左下角：亮暗主题 + 强调色切换 */}
      <div className="rf-theme-bar">
        <div className="rf-theme-row">
          <span className="rf-theme-row-label">主题 · {theme === 'dark' ? '暗色' : '亮色'}</span>
          <button
            type="button"
            className="rf-theme-toggle"
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'light'}
            aria-label={`切换为${theme === 'dark' ? '亮色' : '暗色'}主题`}
            title={`当前 ${theme === 'dark' ? '暗色' : '亮色'} · 点击切换`}
          />
        </div>
        <div className="rf-theme-row">
          <span className="rf-theme-row-label">强调色 · {ACCENT_LABELS[accent]}</span>
          <div className="rf-accent-swatches" role="group" aria-label="选择界面强调色">
            {accents.map((name) => (
              <button
                key={name}
                type="button"
                className={`rf-accent-swatch${name === accent ? ' active' : ''}`}
                data-accent-value={name}
                onClick={() => setAccent(name)}
                aria-pressed={name === accent}
                aria-label={`${ACCENT_LABELS[name]}强调色`}
                title={ACCENT_LABELS[name]}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
