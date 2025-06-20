import React from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Settings, Sparkles } from 'lucide-react';
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
    <div className="toolbar h-16 flex items-center px-8 space-x-2">
      <div className="flex items-center space-x-8">
        {/* Brand Section */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient flex items-center justify-center shadow-purple"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="heading-primary text-gradient">Sub-Stytler</h1>
            <p className="caption">Professional Subtitle Editor</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2 hover-lift"
          >
            <Save className="w-4 h-4" />
            <span className="body-primary">Save Project</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportYTT}
            className="btn-secondary flex items-center space-x-2 hover-lift"
          >
            <Download className="w-4 h-4" />
            <span className="body-primary">Export YTT</span>
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1" />
      
      {/* Project Info & Settings */}
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <div className="body-primary">
            {currentProject?.name || 'Untitled Project'}
          </div>
          <div className="caption">
            {currentProject?.subtitles.length || 0} subtitles
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="btn-icon hover-glow"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};