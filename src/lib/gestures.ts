/**
 * Swipe Gesture Handlers
 * Provides touch gesture detection for mobile interactions
 */

import { useRef, useState } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  duration: number;
  velocity: number;
}

export interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * Swipe detection configuration
 */
export interface SwipeConfig {
  minDistance?: number; // Minimum distance for swipe (px)
  maxTime?: number; // Maximum time for swipe (ms)
  minVelocity?: number; // Minimum velocity (px/ms)
  preventDefaultTouchmoveEvent?: boolean;
}

const DEFAULT_CONFIG: Required<SwipeConfig> = {
  minDistance: 50,
  maxTime: 500,
  minVelocity: 0.3,
  preventDefaultTouchmoveEvent: false,
};

/**
 * Calculate swipe direction and properties
 */
function calculateSwipe(
  start: TouchPoint,
  end: TouchPoint,
  config: Required<SwipeConfig>
): SwipeEvent | null {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const duration = end.time - start.time;
  
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const velocity = distance / duration;

  // Check if swipe meets criteria
  if (distance < config.minDistance || duration > config.maxTime || velocity < config.minVelocity) {
    return null;
  }

  // Determine direction
  let direction: SwipeDirection;
  if (absX > absY) {
    direction = deltaX > 0 ? 'right' : 'left';
  } else {
    direction = deltaY > 0 ? 'down' : 'up';
  }

  return {
    direction,
    distance,
    duration,
    velocity,
  };
}

/**
 * React hook for swipe gestures
 */
export function useSwipe(
  onSwipe: (event: SwipeEvent) => void,
  config: SwipeConfig = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const startPoint = useRef<TouchPoint | null>(null);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startPoint.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (mergedConfig.preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }
    },

    onTouchEnd: (e: React.TouchEvent) => {
      if (!startPoint.current) return;

      const touch = e.changedTouches[0];
      const endPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      const swipeEvent = calculateSwipe(startPoint.current, endPoint, mergedConfig);
      
      if (swipeEvent) {
        onSwipe(swipeEvent);
      }

      startPoint.current = null;
    },
  };

  return handlers;
}

/**
 * React hook for directional swipes
 */
export function useSwipeDirection(
  onLeft?: () => void,
  onRight?: () => void,
  onUp?: () => void,
  onDown?: () => void,
  config: SwipeConfig = {}
) {
  const handleSwipe = (event: SwipeEvent) => {
    switch (event.direction) {
      case 'left':
        onLeft?.();
        break;
      case 'right':
        onRight?.();
        break;
      case 'up':
        onUp?.();
        break;
      case 'down':
        onDown?.();
        break;
    }
  };

  return useSwipe(handleSwipe, config);
}

/**
 * Long press detection
 */
export function useLongPress(
  onLongPress: () => void,
  duration: number = 500
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const start = (_e: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, duration);
  };

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const end = () => {
    cancel();
  };

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: end,
    onTouchMove: cancel,
  };
}

/**
 * Pull to refresh gesture
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  config: {
    threshold?: number;
    resistance?: number;
  } = {}
) {
  const threshold = config.threshold || 80;
  const resistance = config.resistance || 2.5;
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (isRefreshing || window.scrollY > 0) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      if (distance > 0) {
        const adjustedDistance = distance / resistance;
        setPullDistance(adjustedDistance);
        
        if (adjustedDistance > threshold) {
          e.preventDefault();
        }
      }
    },

    onTouchEnd: async () => {
      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      startY.current = 0;
      currentY.current = 0;
    },
  };

  return {
    handlers,
    isRefreshing,
    pullDistance,
    shouldRefresh: pullDistance > threshold,
  };
}

/**
 * Double tap detection
 */
export function useDoubleTap(
  onDoubleTap: () => void,
  delay: number = 300
) {
  const lastTap = useRef<number>(0);

  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;

    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  return {
    onTouchEnd: handleTap,
    onClick: handleTap,
  };
}

/**
 * Pinch zoom detection
 */
export function usePinchZoom(
  onZoom: (scale: number) => void
) {
  const initialDistance = useRef<number>(0);

  const getDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance.current = getDistance(e.touches);
      }
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (e.touches.length === 2 && initialDistance.current > 0) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance.current;
        onZoom(scale);
      }
    },

    onTouchEnd: () => {
      initialDistance.current = 0;
    },
  };

  return handlers;
}

/**
 * Drag gesture detection
 */
export function useDrag(
  onDrag: (deltaX: number, deltaY: number) => void,
  onDragEnd?: () => void
) {
  const startPoint = useRef<TouchPoint | null>(null);
  const isDragging = useRef(false);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startPoint.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      isDragging.current = true;
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (!isDragging.current || !startPoint.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startPoint.current.x;
      const deltaY = touch.clientY - startPoint.current.y;

      onDrag(deltaX, deltaY);
    },

    onTouchEnd: () => {
      isDragging.current = false;
      startPoint.current = null;
      onDragEnd?.();
    },
  };

  return handlers;
}
