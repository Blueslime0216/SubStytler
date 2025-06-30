import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../../stores/themeStore';
import logoDark from '../../../assets/logo.svg';
import logoLight from '../../../assets/logo_light.svg';

export const AppLogo: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const logoSrc = isDarkMode ? logoDark : logoLight;

  return (
    <div className="flex items-center space-x-3 px-3">
      <motion.div
        whileHover={{ scale: [1, 0.92, 1.15], rotate: [0, 0, 6], boxShadow: ['0 0px 0px 0 rgba(94,129,172,0)', '0 0px 0px 0 rgba(94,129,172,0)', '0 4px 24px 0 rgba(94,129,172,0.25)'] }}
        transition={{ type: 'tween', stiffness: 300, damping: 18, duration: 0.45 }}
        className="flex items-center justify-center w-11 h-11 bg-primary-color rounded-xl text-white overflow-hidden group"
      >
        <img src={logoSrc} alt="SubStytler Logo" className="w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-110" />
      </motion.div>
      <div>
        <div className="heading-primary text-lg font-semibold">Sub-Stytler</div>
      </div>
    </div>
  );
};