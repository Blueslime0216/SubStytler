import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PanelType } from '../../types/project';
import { panelConfig } from '../../config/panelConfig';

interface PanelCarouselProps {
  currentType: PanelType;
  onTypeChange: (newType: PanelType) => void;
  className?: string;
}

export const PanelCarousel: React.FC<PanelCarouselProps> = ({
  currentType,
  onTypeChange,
  className = ''
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const panelTypes = Object.keys(panelConfig) as PanelType[];
  
  // Find current type index
  useEffect(() => {
    const currentIndex = panelTypes.indexOf(currentType);
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
  }, [currentType, panelTypes]);

  // Check scroll boundaries
  const checkScrollBoundaries = useCallback(() => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Scroll to specific panel
  const scrollToPanel = useCallback((index: number) => {
    if (!carouselRef.current) return;
    
    const panelWidth = 120; // Panel width + gap
    const targetScroll = index * panelWidth;
    
    carouselRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, []);

  // Handle panel selection
  const handlePanelSelect = useCallback((panelType: PanelType, index: number) => {
    setSelectedIndex(index);
    onTypeChange(panelType);
    scrollToPanel(index);
  }, [onTypeChange, scrollToPanel]);

  // Navigation handlers
  const scrollLeft = useCallback(() => {
    if (!canScrollLeft) return;
    const newIndex = Math.max(0, selectedIndex - 1);
    handlePanelSelect(panelTypes[newIndex], newIndex);
  }, [canScrollLeft, selectedIndex, panelTypes, handlePanelSelect]);

  const scrollRight = useCallback(() => {
    if (!canScrollRight) return;
    const newIndex = Math.min(panelTypes.length - 1, selectedIndex + 1);
    handlePanelSelect(panelTypes[newIndex], newIndex);
  }, [canScrollRight, selectedIndex, panelTypes, handlePanelSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== carouselRef.current && !carouselRef.current?.contains(e.target as Node)) {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          scrollLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          scrollRight();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          // Already selected, no action needed
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollLeft, scrollRight]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.pageX,
      scrollLeft: carouselRef.current.scrollLeft
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - dragStart.x) * 2;
    carouselRef.current.scrollLeft = dragStart.scrollLeft - walk;
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    
    const touch = e.touches[0];
    setDragStart({
      x: touch.pageX,
      scrollLeft: carouselRef.current.scrollLeft
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    
    const touch = e.touches[0];
    const walk = (touch.pageX - dragStart.x) * 2;
    carouselRef.current.scrollLeft = dragStart.scrollLeft - walk;
  }, [dragStart]);

  // Scroll event handler
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      checkScrollBoundaries();
    };

    carousel.addEventListener('scroll', handleScroll);
    checkScrollBoundaries(); // Initial check

    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [checkScrollBoundaries]);

  return (
    <div className={`panel-carousel-container ${className}`}>
      {/* Left Arrow */}
      <motion.button
        className={`panel-carousel-arrow panel-carousel-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        whileHover={{ scale: canScrollLeft ? 1.1 : 1 }}
        whileTap={{ scale: canScrollLeft ? 0.9 : 1 }}
        title="Previous panel"
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="panel-carousel-track"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        tabIndex={0}
        role="listbox"
        aria-label="Panel type selector"
      >
        {panelTypes.map((panelType, index) => {
          const config = panelConfig[panelType];
          const Icon = config.icon;
          const isSelected = index === selectedIndex;
          
          return (
            <motion.div
              key={panelType}
              className={`panel-carousel-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handlePanelSelect(panelType, index)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              role="option"
              aria-selected={isSelected}
              tabIndex={-1}
            >
              {/* Panel Preview */}
              <div className="panel-preview">
                <div className="panel-preview-icon">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="panel-preview-content">
                  <div className="panel-preview-lines">
                    <div className="panel-preview-line" />
                    <div className="panel-preview-line short" />
                    <div className="panel-preview-line" />
                  </div>
                </div>
              </div>
              
              {/* Panel Label */}
              <div className="panel-label">
                <span className="panel-title">{config.title}</span>
                <span className="panel-description">{config.description}</span>
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  className="panel-selection-indicator"
                  layoutId="selection-indicator"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <motion.button
        className={`panel-carousel-arrow panel-carousel-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
        onClick={scrollRight}
        disabled={!canScrollRight}
        whileHover={{ scale: canScrollRight ? 1.1 : 1 }}
        whileTap={{ scale: canScrollRight ? 0.9 : 1 }}
        title="Next panel"
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>

      {/* Progress Dots */}
      <div className="panel-carousel-dots">
        {panelTypes.map((_, index) => (
          <button
            key={index}
            className={`panel-carousel-dot ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => handlePanelSelect(panelTypes[index], index)}
            aria-label={`Go to ${panelConfig[panelTypes[index]].title}`}
          />
        ))}
      </div>
    </div>
  );
};