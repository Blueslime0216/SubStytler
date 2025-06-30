import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save } from 'lucide-react';
import { ProjectFileMenu } from '../../UI/ProjectFileMenu';
import { ExportMenu } from '../../UI/ExportMenu';
import { AutoSaveMenu } from '../../UI/AutoSaveMenu';
import { LayoutTemplateButton } from '../../UI/LayoutTemplateButton';
import { useProjectStore } from '../../../stores/projectStore';

interface MainMenuButtonsProps {
  onLoadProject: () => Promise<void>;
  onNewProject: () => void;
}

export const MainMenuButtons: React.FC<MainMenuButtonsProps> = ({
  onLoadProject,
  onNewProject
}) => {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAutoSaveMenuOpen, setIsAutoSaveMenuOpen] = useState(false);
  
  const fileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const exportMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const autoSaveMenuTriggerRef = useRef<HTMLButtonElement>(null);
  
  const { currentProject } = useProjectStore();

  return (
    <>
      <div className="flex items-center space-x-2">
        <motion.button
          ref={fileMenuTriggerRef}
          onClick={() => {
            setIsFileMenuOpen(!isFileMenuOpen);
            setIsExportMenuOpen(false);
            setIsAutoSaveMenuOpen(false);
          }}
          className="btn-sm px-4 py-2 text-sm flex items-center hover:bg-mid-color transition-all"
          whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <FileText className="w-4 h-4 mr-2" />
          <span>Project</span>
        </motion.button>
        
        <motion.button
          ref={exportMenuTriggerRef}
          onClick={() => {
            setIsExportMenuOpen(!isExportMenuOpen);
            setIsFileMenuOpen(false);
            setIsAutoSaveMenuOpen(false);
          }}
          className="btn-sm px-4 py-2 text-sm flex items-center hover:bg-mid-color disabled:opacity-50 transition-all"
          whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          disabled={!currentProject || !currentProject.subtitles.length}
        >
          <FileText className="w-4 h-4 mr-2" />
          <span>Export</span>
        </motion.button>
        
        <LayoutTemplateButton />
        
        <motion.button
          ref={autoSaveMenuTriggerRef}
          onClick={() => {
            setIsAutoSaveMenuOpen(!isAutoSaveMenuOpen);
            setIsFileMenuOpen(false);
            setIsExportMenuOpen(false);
          }}
          className="btn-sm px-4 py-2 text-sm flex items-center hover:bg-mid-color disabled:opacity-50 transition-all"
          whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Save className="w-4 h-4 mr-2" />
          <span>Auto Save</span>
        </motion.button>
      </div>

      {/* Project File Menu */}
      <ProjectFileMenu
        isOpen={isFileMenuOpen}
        onClose={() => setIsFileMenuOpen(false)}
        triggerRef={fileMenuTriggerRef}
        onLoadProject={onLoadProject}
        onNewProject={onNewProject}
        hasVideo={!!currentProject?.videoMeta}
      />

      {/* Export Menu */}
      <ExportMenu
        isOpen={isExportMenuOpen}
        onClose={() => setIsExportMenuOpen(false)}
        triggerRef={exportMenuTriggerRef}
      />

      {/* Auto Save Menu */}
      <AutoSaveMenu
        isOpen={isAutoSaveMenuOpen}
        onClose={() => setIsAutoSaveMenuOpen(false)}
        triggerRef={autoSaveMenuTriggerRef}
      />
    </>
  );
};