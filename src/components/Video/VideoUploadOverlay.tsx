import React from 'react';
import { motion } from 'framer-motion';

interface VideoUploadOverlayProps {
  isDragActive: boolean;
  getRootProps: () => any;
  getInputProps: () => any;
}

export const VideoUploadOverlay: React.FC<VideoUploadOverlayProps> = ({
  isDragActive,
  getRootProps,
  getInputProps
}) => {
  // 🎯 이 컴포넌트는 더 이상 사용되지 않음 - 빈 컴포넌트로 변경
  return null;
};