import React from 'react';
import { AISystem } from './AIModeSwitch';

export interface SystemFlowDiagramProps {
    system: AISystem;
}

/**
 * Renders a visual flow diagram showing how the selected AI system processes requests.
 */
const SystemFlowDiagram: React.FC<SystemFlowDiagramProps> = ({ system }) => {
    if (system === 'langgraph') {
        return (
            <div className="w-full overflow-x-auto">
                <svg width="100%" height="280" viewBox="0 0 800 280" className="min-w-[600px]">
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
                        </marker>
                    </defs>
                    
                    {/* Node boxes */}
                    <g>
                        {/* Start */}
                        <rect x="20" y="120" width="100" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                        <text x="70" y="145" textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600">START</text>
                        
                        {/* Identify */}
                        <rect x="160" y="120" width="120" height="40" rx="8" fill="#dbeafe" stroke="#60a5fa" strokeWidth="2" />
                        <text x="220" y="145" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="600">Identify Type</text>
                        
                        {/* Start Extraction */}
                        <rect x="320" y="120" width="120" height="40" rx="8" fill="#dbeafe" stroke="#60a5fa" strokeWidth="2" />
                        <text x="380" y="145" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="600">Start Extraction</text>
                        
                        {/* Extract Settings */}
                        <rect x="480" y="120" width="120" height="40" rx="8" fill="#dbeafe" stroke="#60a5fa" strokeWidth="2" />
                        <text x="540" y="145" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="600">Extract Settings</text>
                        
                        {/* Conditional paths */}
                        <rect x="480" y="60" width="120" height="40" rx="8" fill="#fef3c7" stroke="#fbbf24" strokeWidth="2" />
                        <text x="540" y="85" textAnchor="middle" fontSize="11" fill="#92400e" fontWeight="600">Push Context</text>
                        
                        <rect x="480" y="200" width="120" height="40" rx="8" fill="#d1fae5" stroke="#34d399" strokeWidth="2" />
                        <text x="540" y="225" textAnchor="middle" fontSize="11" fill="#065f46" fontWeight="600">Complete Level</text>
                        
                        {/* Finalize */}
                        <rect x="640" y="120" width="120" height="40" rx="8" fill="#dcfce7" stroke="#4ade80" strokeWidth="2" />
                        <text x="700" y="145" textAnchor="middle" fontSize="11" fill="#166534" fontWeight="600">Finalize</text>
                        
                        {/* End */}
                        <rect x="780" y="120" width="100" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                        <text x="830" y="145" textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600">END</text>
                    </g>
                    
                    {/* Arrows */}
                    <g stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)">
                        {/* Main sequential flow */}
                        <line x1="120" y1="140" x2="160" y2="140" />
                        <line x1="280" y1="140" x2="320" y2="140" />
                        <line x1="440" y1="140" x2="480" y2="140" />
                        <line x1="600" y1="140" x2="640" y2="140" />
                        <line x1="760" y1="140" x2="780" y2="140" />
                        
                        {/* Conditional from Extract Settings to Push Context (recursive) */}
                        <line x1="540" y1="120" x2="540" y2="100" />
                        {/* Loop back from Push Context to Extract Settings */}
                        <path d="M 480 80 Q 400 50 400 140 Q 400 230 480 160" strokeDasharray="5,5" />
                        
                        {/* Conditional from Extract Settings to Complete Level */}
                        <line x1="540" y1="160" x2="540" y2="200" />
                        {/* From Complete Level back to Extract Settings (loop) */}
                        <path d="M 480 220 Q 400 240 480 160" strokeDasharray="5,5" />
                        {/* From Complete Level to Finalize */}
                        <line x1="600" y1="220" x2="640" y2="160" />
                    </g>
                    
                    {/* Labels */}
                    <text x="140" y="135" fontSize="9" fill="#64748b">→</text>
                    <text x="300" y="135" fontSize="9" fill="#64748b">→</text>
                    <text x="460" y="135" fontSize="9" fill="#64748b">→</text>
                    <text x="620" y="135" fontSize="9" fill="#64748b">→</text>
                    <text x="400" y="35" fontSize="9" fill="#92400e" fontStyle="italic">recursive</text>
                    <text x="400" y="250" fontSize="9" fill="#065f46" fontStyle="italic">conditional</text>
                </svg>
            </div>
        );
    } else {
        return (
            <div className="w-full overflow-x-auto">
                <svg width="100%" height="200" viewBox="0 0 700 200" className="min-w-[500px]">
                    <defs>
                        <marker
                            id="arrowhead-legacy"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
                        </marker>
                    </defs>
                    
                    {/* Node boxes */}
                    <g>
                        {/* Start */}
                        <rect x="20" y="80" width="100" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                        <text x="70" y="105" textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600">START</text>
                        
                        {/* Type Identification */}
                        <rect x="160" y="80" width="140" height="40" rx="8" fill="#dbeafe" stroke="#60a5fa" strokeWidth="2" />
                        <text x="230" y="105" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="600">Type Identification</text>
                        
                        {/* Settings Extraction */}
                        <rect x="340" y="80" width="140" height="40" rx="8" fill="#dbeafe" stroke="#60a5fa" strokeWidth="2" />
                        <text x="410" y="105" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="600">Settings Extraction</text>
                        
                        {/* Validation */}
                        <rect x="520" y="80" width="120" height="40" rx="8" fill="#d1fae5" stroke="#34d399" strokeWidth="2" />
                        <text x="580" y="105" textAnchor="middle" fontSize="11" fill="#065f46" fontWeight="600">Validation</text>
                        
                        {/* End */}
                        <rect x="680" y="80" width="100" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                        <text x="730" y="105" textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600">END</text>
                    </g>
                    
                    {/* Arrows */}
                    <g stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-legacy)">
                        <line x1="120" y1="100" x2="160" y2="100" />
                        <line x1="300" y1="100" x2="340" y2="100" />
                        <line x1="480" y1="100" x2="520" y2="100" />
                        <line x1="640" y1="100" x2="680" y2="100" />
                    </g>
                    
                    {/* Labels */}
                    <text x="140" y="95" fontSize="10" fill="#64748b">chain</text>
                    <text x="320" y="95" fontSize="10" fill="#64748b">chain</text>
                    <text x="500" y="95" fontSize="10" fill="#64748b">chain</text>
                </svg>
            </div>
        );
    }
};

export default SystemFlowDiagram;




