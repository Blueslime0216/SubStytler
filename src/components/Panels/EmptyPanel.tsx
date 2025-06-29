import React from 'react';
import { motion } from 'framer-motion';
import logoDark from '../../assets/logo.svg';
import logoLight from '../../assets/logo_light.svg';
import { useThemeStore } from '../../stores/themeStore';

export const EmptyPanel: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const logoSrc = isDarkMode ? logoDark : logoLight;
  
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-text-secondary">
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img 
          src={logoSrc} 
          alt="Sub-Stytler Logo" 
          className="w-16 h-16 mb-4 opacity-40"
          whileHover={{ 
            scale: 1.1, 
            rotate: [0, -5, 5, 0],
            opacity: 0.7
          }}
          transition={{ 
            duration: 0.5,
            rotate: { repeat: Infinity, duration: 2 }
          }}
        />
        <p className="text-sm">Select a panel type to begin</p>
      </motion.div>
    </div>
  );
};