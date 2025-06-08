'use client';

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";

export default function Home() {
  // Core state management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, translate: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  
  // Product data
  const products = [
    { id: 1, name: "GAME ON 49", image: "/product/condom-product-GAME ON-49.png" },
    { id: 2, name: "GAME ON 52", image: "/product/condom-product-GAME ON-52.png" },
    { id: 3, name: "GAME ON 54", image: "/product/condom-product-GAME ON-54.png" },
    { id: 4, name: "GAME ON 56", image: "/product/condom-product-GAME ON-56.png" },
    { id: 5, name: "GAME ON 60", image: "/product/condom-product-GAME ON-60.png" },
  ];
  
  // Loop configuration
  const CARD_WIDTH = 320; // 300px card + 20px gap
  const TOTAL_PRODUCTS = products.length;
  const LOOP_SETS = 3; // Render 3 complete sets
  const CENTER_SET = 1; // Index of the center set (0, 1, 2)

  // Calculate the position for centering a product
  const getCenterPosition = useCallback((productIndex) => {
    if (!containerRef.current) return 0;
    
    const containerWidth = containerRef.current.offsetWidth;
    const viewportCenter = containerWidth / 2;
    const cardCenter = 150; // Half of 300px card width
    
    // Position in center set
    const centerSetOffset = CENTER_SET * TOTAL_PRODUCTS * CARD_WIDTH;
    const productOffset = productIndex * CARD_WIDTH;
    
    return viewportCenter - cardCenter - centerSetOffset - productOffset;
  }, [TOTAL_PRODUCTS]);

  // Handle infinite loop boundary repositioning
  const handleLoopBoundaries = useCallback((currentTranslate) => {
    const setWidth = TOTAL_PRODUCTS * CARD_WIDTH;
    
    // More generous boundaries to ensure smooth transitions
    const leftBoundary = setWidth * 0.3; // When we're too far right (positive values)
    const rightBoundary = -setWidth * 1.7; // When we're too far left (negative values)
    
    if (currentTranslate > leftBoundary) {
      // Moved too far right, shift to left set (more negative)
      return currentTranslate - setWidth;
    } else if (currentTranslate < rightBoundary) {
      // Moved too far left, shift to right set (less negative)
      return currentTranslate + setWidth;
    }
    
    return currentTranslate;
  }, [TOTAL_PRODUCTS]);

  // Navigate to specific product with improved infinite loop handling
  const navigateToProduct = useCallback((targetIndex) => {
    // Normalize index to valid range
    const normalizedIndex = ((targetIndex % TOTAL_PRODUCTS) + TOTAL_PRODUCTS) % TOTAL_PRODUCTS;
    
    console.log(`Navigating from ${currentIndex} to ${normalizedIndex} (original target: ${targetIndex})`);
    console.log(`Current translateX: ${translateX}`);
    
    setCurrentIndex(normalizedIndex);
    
    // Calculate the target position
    let newTranslate = getCenterPosition(normalizedIndex);
    
    // For smooth infinite loop, check if we need to adjust position based on current translate
    // This handles cases where we're transitioning from last to first or first to last
    if (Math.abs(translateX) > 0) {
      const setWidth = TOTAL_PRODUCTS * CARD_WIDTH;
      
      console.log(`Set width: ${setWidth}`);
      
      // If we're transitioning from last product (4) to first product (0)
      if (currentIndex === TOTAL_PRODUCTS - 1 && normalizedIndex === 0) {
        console.log('Transitioning from last to first - adjusting for smooth scroll');
        // Move to the next set to maintain smooth scrolling
        newTranslate -= setWidth;
      }
      // If we're transitioning from first product (0) to last product (4)
      else if (currentIndex === 0 && normalizedIndex === TOTAL_PRODUCTS - 1) {
        console.log('Transitioning from first to last - adjusting for smooth scroll');
        // Move to the previous set to maintain smooth scrolling
        newTranslate += setWidth;
      }
    }
    
    console.log(`Initial newTranslate: ${newTranslate}`);
    
    // Apply boundary handling to ensure we're in the correct set
    newTranslate = handleLoopBoundaries(newTranslate);
    
    console.log(`Final newTranslate after boundaries: ${newTranslate}`);
    
    setTranslateX(newTranslate);
  }, [TOTAL_PRODUCTS, getCenterPosition, translateX, currentIndex, handleLoopBoundaries]);

  // Calculate which product is currently centered
  const getCurrentProductFromPosition = useCallback((translate) => {
    if (!containerRef.current) return 0;
    
    const containerWidth = containerRef.current.offsetWidth;
    const viewportCenter = containerWidth / 2;
    const cardCenter = 150;
    
    // Calculate the product position that would be centered
    const centerSetOffset = CENTER_SET * TOTAL_PRODUCTS * CARD_WIDTH;
    const targetPosition = viewportCenter - cardCenter - translate - centerSetOffset;
    const productIndex = Math.round(targetPosition / CARD_WIDTH);
    
    return ((productIndex % TOTAL_PRODUCTS) + TOTAL_PRODUCTS) % TOTAL_PRODUCTS;
  }, [TOTAL_PRODUCTS]);

  // Initialize slider position
  useEffect(() => {
    if (!isInitialized && containerRef.current) {
      setIsInitialized(true);
      const initialPosition = getCenterPosition(0);
      setTranslateX(initialPosition);
    }
  }, [isInitialized, getCenterPosition]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isInitialized) {
        const newPosition = getCenterPosition(currentIndex);
        setTranslateX(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized, currentIndex, getCenterPosition]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, translate: translateX });
    
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grabbing';
    }
  }, [translateX]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    let newTranslate = dragStart.translate + deltaX;
    
    // Handle loop boundaries during drag
    newTranslate = handleLoopBoundaries(newTranslate);
    setTranslateX(newTranslate);
    
    // Update current index during drag with debouncing for fast movements
    const newIndex = getCurrentProductFromPosition(newTranslate);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [isDragging, dragStart, handleLoopBoundaries, getCurrentProductFromPosition, currentIndex]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }

    // Snap to nearest product with improved threshold for fast movements
    const dragDistance = translateX - dragStart.translate;
    const threshold = CARD_WIDTH * 0.2; // Reduced threshold for more responsive snapping
    
    let targetIndex = currentIndex;
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        targetIndex = currentIndex - 1; // Dragged right
      } else {
        targetIndex = currentIndex + 1; // Dragged left
      }
    }
    
    navigateToProduct(targetIndex);
  }, [isDragging, translateX, dragStart, currentIndex, navigateToProduct]);

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, translate: translateX });
  }, [translateX]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - dragStart.x;
    let newTranslate = dragStart.translate + deltaX;
    
    // Handle loop boundaries during drag
    newTranslate = handleLoopBoundaries(newTranslate);
    setTranslateX(newTranslate);
    
    // Update current index during drag with debouncing for fast movements
    const newIndex = getCurrentProductFromPosition(newTranslate);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [isDragging, dragStart, handleLoopBoundaries, getCurrentProductFromPosition, currentIndex]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Snap to nearest product with improved threshold for fast movements
    const dragDistance = translateX - dragStart.translate;
    const threshold = CARD_WIDTH * 0.2; // Reduced threshold for more responsive snapping
    
    let targetIndex = currentIndex;
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        targetIndex = currentIndex - 1;
      } else {
        targetIndex = currentIndex + 1;
      }
    }
    
    navigateToProduct(targetIndex);
  }, [isDragging, translateX, dragStart, currentIndex, navigateToProduct]);

  // Global event listeners for smooth dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.body.style.userSelect = 'none';
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#070A1B' }}>
      {/* Centered Product Content Container */}
      <div className="flex flex-col items-center justify-center w-full max-w-6xl">        {/* Playful Logo */}
        <div className="mb-4">
          <Image
            src="/logo/playful2.png"
            alt="Playful Logo"
            width={200}
            height={100}
            className="object-contain"
            priority
          />        </div>
        
        {/* Slider Container */}
        <div className="w-full">
          <div 
            ref={containerRef}
            className="w-full max-w-6xl overflow-hidden"
          >
            {/* Product Slider with Improved Infinite Loop */}
            <div
              ref={sliderRef}
              className="flex cursor-grab select-none"
              style={{
                transform: `translateX(${translateX}px)`,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                gap: '20px',
                width: 'max-content'
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDragStart={(e) => e.preventDefault()}
            >
              {/* Render multiple sets for seamless infinite loop */}
              {Array.from({ length: LOOP_SETS }, (_, setIndex) =>
                products.map((product, productIndex) => (
                  <div
                    key={`set-${setIndex}-product-${product.id}`}
                    className="flex-shrink-0"
                    style={{ width: '300px' }}
                  >
                    <div className="relative w-full h-80 rounded-xl overflow-hidden transition-all duration-300">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 pointer-events-none"
                        sizes="300px"
                        draggable={false}
                        priority={setIndex === CENTER_SET}
                      />
                    </div>
                  </div>
                ))
              ).flat()}
            </div>
          </div>
        </div>

        {/* Navigation Wheel */}
        <div className="mt-8">
          <div 
            className="relative w-64 h-64 mx-auto transition-transform duration-500 ease-out"
            style={{
              transform: `rotate(${-currentIndex * (360 / products.length)}deg)`,
              transition: isDragging ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
            }}
          >
            <Image
              src="/product_nav/wheel-1.png"
              alt="Navigation Wheel"
              fill
              className="object-contain"
              sizes="256px"
            />
          </div>        </div>
      </div>
    </div>
  );
}
