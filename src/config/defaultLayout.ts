import { AreaConfig } from '../types/project';

export const createDefaultLayout = (): AreaConfig[] => [
  {
    id: 'root',
    type: 'split',
    direction: 'horizontal',
    children: [
      {
        id: 'left-panel',
        type: 'panel',
        panelType: 'video-preview',
        size: 60,
        minSize: 25,
        maxSize: 75
      },
      {
        id: 'right-section',
        type: 'split',
        direction: 'vertical',
        size: 40,
        minSize: 25,
        maxSize: 75,
        children: [
          {
            id: 'timeline-panel',
            type: 'panel',
            panelType: 'subtitle-timeline',
            size: 30,
            minSize: 20,
            maxSize: 80
          },
          {
            id: 'editor-panel',
            type: 'panel',
            panelType: 'text-editor',
            size: 70,
            minSize: 20,
            maxSize: 80
          }
        ]
      }
    ]
  }
];