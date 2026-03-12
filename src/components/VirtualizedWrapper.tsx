import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface VirtualizedWrapperProps {
  children: React.ReactNode;
  defaultHeight?: number;
  className?: string;
}

export default function VirtualizedWrapper({ children, defaultHeight = 200, className = '' }: VirtualizedWrapperProps) {
  const { ref, inView } = useInView({
    rootMargin: '400px 0px', // Load content when within 400px of viewport
    triggerOnce: false,
  });

  const [height, setHeight] = useState<number | undefined>(defaultHeight);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView && containerRef.current) {
      // Record the actual height when rendered
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [inView]);

  return (
    <div ref={ref} style={{ minHeight: height }} className={className}>
      {inView ? (
        <div ref={containerRef}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
