import React from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Settings, Cog, Wrench, Gauge } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';

export const Toolbar: React.FC = () => {
  const { saveProject, currentProject } = useProjectStore();

  const handleSave = () => {
    saveProject();
  };

  const handleExportYTT = () => {
    if (!currentProject) return;
    
    const yttContent = generateYTTContent(currentProject);
    const blob = new Blob([yttContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}.ytt`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const generateYTTContent = (project: any) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<timedtext format="3">
  <head>
    <wp id="0"/>
    <ws id="0" ju="2" pd="0"/>
`;

    project.styles.forEach((style: any, index: number) => {
      xml += `    <pen id="${index}" fc="${style.fc}" fo="${style.fo || 1}" bc="${style.bc}" bo="${style.bo || 0.8}" fs="${style.fs}" sz="${style.sz}"/>\n`;
    });

    xml += `  </head>
  <body>
`;

    project.subtitles.forEach((subtitle: any) => {
      const startTime = Math.floor(subtitle.startTime);
      const duration = Math.floor(subtitle.endTime - subtitle.startTime);
      
      xml += `    <p t="${startTime}" d="${duration}" wp="0" ws="0">
      <s p="0">${subtitle.spans[0]?.text || ''}</s>
    </p>
`;
    });

    xml += `  </body>
</timedtext>`;

    return xml;
  };

  return (
    <div className="toolbar-steampunk relative">
      {/* 장식용 기어들 */}
      <div className="absolute top-2 left-4">
        <Cog className="w-4 h-4 text-copper gear opacity-30" />
      </div>
      <div className="absolute top-1 right-8">
        <Cog className="w-3 h-3 text-brass gear-reverse opacity-40" />
      </div>
      <div className="absolute bottom-1 left-20">
        <Cog className="w-2 h-2 text-bronze gear-slow opacity-25" />
      </div>
      
      {/* 리벳 장식 */}
      <div className="rivet-decoration top-2 left-2"></div>
      <div className="rivet-decoration top-2 right-2"></div>
      <div className="rivet-decoration bottom-2 left-2"></div>
      <div className="rivet-decoration bottom-2 right-2"></div>
      
      <div className="flex items-center justify-between relative z-10">
        {/* 브랜드 섹션 */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 bg-brass rounded-lg flex items-center justify-center shadow-brass relative overflow-hidden">
                <Wrench className="w-4 h-4 text-workshop" />
                <div className="absolute inset-0 texture-metal opacity-30"></div>
              </div>
              {/* 증기 효과 */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="steam-particle w-1 h-1 bg-steel-light rounded-full opacity-0"></div>
                <div className="steam-particle w-1 h-1 bg-steel-light rounded-full opacity-0"></div>
                <div className="steam-particle w-1 h-1 bg-steel-light rounded-full opacity-0"></div>
              </div>
            </motion.div>
            <div>
              <h1 className="font-steampunk text-lg font-bold text-brass">Sub-Stytler</h1>
              <p className="font-mono text-xs text-muted">Steampunk Workshop</p>
            </div>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="btn-steampunk-small flex items-center space-x-2"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportYTT}
              className="btn-steampunk-small flex items-center space-x-2"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </motion.button>
          </div>
        </div>
        
        {/* 상태 및 설정 */}
        <div className="flex items-center space-x-6">
          {/* 압력 게이지 */}
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-brass pressure-gauge" />
            <div className="text-xs font-mono">
              <span className="text-brass">{currentProject?.subtitles.length || 0}</span>
              <span className="text-muted"> subtitles</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-steampunk text-sm font-medium text-primary">
              {currentProject?.name || 'Untitled Project'}
            </div>
            <div className="font-mono text-xs text-muted">
              Workshop Active
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="btn-steampunk-icon"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};