import { ReactFlowProvider } from '@xyflow/react'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import CanvasFlow from './components/CanvasFlow'
import DetailPanel from './components/DetailPanel'
import './styles/index.css'

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="rf-app">
        <Toolbar />
        <div className="rf-main">
          <Sidebar />
          <CanvasFlow />
          <DetailPanel />
        </div>
      </div>
    </ReactFlowProvider>
  )
}
