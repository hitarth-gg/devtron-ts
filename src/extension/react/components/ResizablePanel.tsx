import { useCallback, useEffect, useState } from 'react';

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  direction?: 'right' | 'bottom';
};

function ResizablePanel({ children, isOpen, direction = 'right' }: Props) {
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(() => window.innerWidth / 3);
  const [height, setHeight] = useState(() => window.innerHeight / 3);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      if (direction === 'right') {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 50 && newWidth <= window.innerWidth - 50) {
          setWidth(newWidth);
        }
      } else if (direction === 'bottom') {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 35 && newHeight <= window.innerHeight - 50) {
          setHeight(newHeight);
        }
      }
    },
    [isResizing, direction]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  if (direction === 'bottom') {
    return (
      <div className="flex flex-col w-full">
        {/* Resize handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`h-1 cursor-row-resize transition-colors ${
            isResizing ? 'bg-blue-500' : 'hover:bg-gray-400'
          }`}
        />
        {/* Children */}
        <div style={{ height: `${height}px` }} className="w-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 cursor-col-resize transition-colors ${
          isResizing ? 'bg-blue-500' : 'hover:bg-gray-400'
        }`}
      />
      {/* Children */}
      <div style={{ width: `${width}px` }} className="h-full">
        {children}
      </div>
    </div>
  );
}

export default ResizablePanel;
