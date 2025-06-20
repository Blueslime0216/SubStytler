import React from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Settings, Film, Clapperboard, Camera } from 'lucide-react';
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
    <div className="toolbar-cinematic h-20 flex items-center px-10 space-x-2">
      <div className="flex items-center space-x-10">
        {/* 시네마틱 브랜드 섹션 */}
        <div className="flex items-center space-x-5">
          <motion.div 
            className="w-12 h-12 rounded-xl bg-cinematic-gold flex items-center justify-center shadow-cinematic-gold"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Film className="w-6 h-6 text-black" />
          </motion.div>
          <div>
            <h1 className="heading-cinematic-primary text-cinematic-gradient">Sub-Stytler</h1>
            <p className="caption-cinematic">Professional Cinematic Editor</p>
          </div>
        </div>
        
        {/* 시네마틱 액션 버튼들 */}
        <div className="flex items-center space-x-5">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="btn-cinematic-primary flex items-center space-x-3 hover-cinematic"
          >
            <Save className="w-5 h-5" />
            <span className="body-cinematic-primary">Save Project</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportYTT}
            className="btn-cinematic-secondary flex items-center space-x-3 hover-cinematic"
          >
            <Download className="w-5 h-5" />
            <span className="body-cinematic-primary">Export YTT</span>
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1" />
      
      {/* 시네마틱 프로젝트 정보 & 설정 */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-4">
          <Clapperboard className="w-5 h-5 text-cinematic-gold" />
          <div className="text-right">
            <div className="body-cinematic-primary">
              {currentProject?.name || 'Untitled Project'}
            </div>
            <div className="caption-cinematic">
              {currentProject?.subtitles.length || 0} scenes • Ready for action
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="btn-cinematic-icon hover-cinematic-glow"
        >
          <Settings className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};