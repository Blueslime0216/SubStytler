import React from 'react';
import { Panel } from '../components/Layout/Panel';
import { PanelType } from '../types/project';

export const panelRegistry = {
  video: () => <Panel type="video-preview" areaId="video" />,
  timeline: () => <Panel type="subtitle-timeline" areaId="timeline" />,
  text: () => <Panel type="text-editor" areaId="text" />,
} as const;

export type PanelId = keyof typeof panelRegistry;

// Helper function to create panel with proper props
export const createPanel = (type: PanelType, areaId: string) => {
  return <Panel type={type} areaId={areaId} />;
};