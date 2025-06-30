import { useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useYTTStore } from '../stores/yttStore';
import { generateYTTContent } from '../utils/yttGenerator';

export const useYTTSync = () => {
  const { currentProject } = useProjectStore();
  const { loadYTT } = useYTTStore();

  useEffect(() => {
    if (!currentProject) return;
    const yttXml = generateYTTContent(currentProject as any);
    loadYTT(yttXml);
  }, [currentProject, loadYTT]);
}; 