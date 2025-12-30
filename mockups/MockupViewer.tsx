import { useState } from 'react';
import { DashboardMockup } from './DashboardMockup';
import { GuestManagementMockup } from './GuestManagementMockup';
import { SurveyBuilderMockup } from './SurveyBuilderMockup';
import { OptimizationResultsMockup } from './OptimizationResultsMockup';
import { MobileResponsiveMockup } from './MobileResponsiveMockup';
import { GestureImmersiveMockup } from './GestureImmersiveMockup';
import './MockupViewer.css';

const mockups = [
  { id: 'gesture', name: 'Gesture Immersive', component: GestureImmersiveMockup },
  { id: 'dashboard', name: 'Dashboard', component: DashboardMockup },
  { id: 'guests', name: 'Guest Management', component: GuestManagementMockup },
  { id: 'survey', name: 'Survey Builder', component: SurveyBuilderMockup },
  { id: 'optimization', name: 'Optimization Results', component: OptimizationResultsMockup },
  { id: 'mobile', name: 'Mobile Responsive', component: MobileResponsiveMockup },
];

export function MockupViewer() {
  const [activeMockup, setActiveMockup] = useState('gesture');
  const ActiveComponent = mockups.find(m => m.id === activeMockup)?.component || GestureImmersiveMockup;

  return (
    <div className="mockup-viewer">
      <nav className="mockup-nav">
        <h2>Mockups</h2>
        {/* Mobile: Dropdown selector */}
        <select
          className="mockup-select"
          value={activeMockup}
          onChange={(e) => setActiveMockup(e.target.value)}
        >
          {mockups.map(mockup => (
            <option key={mockup.id} value={mockup.id}>
              {mockup.name}
            </option>
          ))}
        </select>
        {/* Desktop: Tab buttons */}
        <div className="mockup-tabs">
          {mockups.map(mockup => (
            <button
              key={mockup.id}
              className={`mockup-tab ${activeMockup === mockup.id ? 'active' : ''}`}
              onClick={() => setActiveMockup(mockup.id)}
            >
              {mockup.name}
            </button>
          ))}
        </div>
      </nav>
      <div className="mockup-content">
        <ActiveComponent />
      </div>
    </div>
  );
}

export default MockupViewer;
