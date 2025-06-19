import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const getVolumeFromPosition = (clientX: number): number => {
    if (!volumeBarRef.current) return volume;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return percentage;
  };

  const handleVolumeBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const newVolume = getVolumeFromPosition(e.clientX);
    onVolumeChange(newVolume);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const newVolume = getVolumeFromPosition(e.clientX);
    onVolumeChange(Math.max(0, Math.min(1, newVolume)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();
  const volumePercentage = (isMuted ? 0 : volume) * 100;

  return (
    <div 
      className={`flex items-center space-x-2 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mute/Unmute Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMuteToggle}
        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="w-4 h-4 text-white" />
      </motion.button>
      
      {/* Volume Slider */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isHovered || isDragging ? 80 : 0,
          opacity: isHovered || isDragging ? 1 : 0
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div 
          ref={volumeBarRef}
          className="h-1 bg-gray-600 rounded-full cursor-pointer relative group"
          onMouseDown={handleVolumeBarMouseDown}
        >
          {/* Volume fill */}
          <motion.div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            style={{ width: `${volumePercentage}%` }}
            animate={{ width: `${volumePercentage}%` }}
            transition={{ duration: isDragging ? 0 : 0.1 }}
          />
          
          {/* Volume handle */}
          <motion.div 
            className={`absolute top-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-y-1/2 -translate-x-1/2 border border-white shadow-sm transition-all ${
              isDragging ? 'scale-110' : 'scale-100'
            }`}
            style={{ left: `${volumePercentage}%` }}
            animate={{ 
              left: `${volumePercentage}%`,
              scale: isDragging ? 1.1 : 1
            }}
            transition={{ duration: isDragging ? 0 : 0.1 }}
          />
          
          {/* Volume tooltip */}
          {isDragging && (
            <motion.div 
              className="absolute -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10"
              style={{ left: `${volumePercentage}%`, transform: 'translateX(-50%)' }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {Math.round(volume * 100)}%
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};