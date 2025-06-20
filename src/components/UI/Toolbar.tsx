import React from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Settings, Zap, Satellite } from 'lucide-react';
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
    <div className="station-toolbar h-20 flex items-center px-10 space-x-2">
      <div className="flex items-center space-x-10">
        {/* 우주 정거장 브랜드 섹션 */}
        <div className="flex items-center space-x-5">
          <motion.div 
            className="w-12 h-12 rounded-xl bg-energy flex items-center justify-center shadow-energy"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Satellite className="w-6 h-6 text-white cosmic-rotation" />
          </motion.div>
          <div>
            <h1 className="heading-station-primary text-energy-gradient">Sub-Stytler</h1>
            <p className="caption-station">Deep Space Subtitle Station</p>
          </div>
        </div>
        
        {/* 우주 정거장 액션 버튼들 */}
        <div className="flex items-center space-x-5">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="btn-station-primary flex items-center space-x-3 hover-station"
          >
            <Save className="w-5 h-5" />
            <span className="body-station-primary">Save Mission</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportYTT}
            className="btn-station-secondary flex items-center space-x-3 hover-station"
          >
            <Download className="w-5 h-5" />
            <span className="body-station-primary">Export Data</span>
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1" />
      
      {/* 우주 정거장 프로젝트 정보 & 설정 */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-4">
          <Zap className="w-5 h-5 text-plasma energy-pulse" />
          <div className="text-right">
            <div className="body-station-primary">
              {currentProject?.name || 'Mission Alpha-7'}
            </div>
            <div className="caption-station">
              {currentProject?.subtitles.length || 0} sequences • Station ready
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="btn-station-icon hover-energy"
        >
          <Settings className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};