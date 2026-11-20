import React, { useState, useEffect } from "react";

const PageWrapper = ({ children }) => {
  const [topbarHeight, setTopbarHeight] = useState(0);

  useEffect(() => {
    const updateTopbarHeight = () => {
      const topbar = document.querySelector('nav');
      if (topbar) {
        setTopbarHeight(topbar.offsetHeight);
      }
    };

    updateTopbarHeight();
    window.addEventListener('resize', updateTopbarHeight);
    
    return () => {
      window.removeEventListener('resize', updateTopbarHeight);
    };
  }, []);

  return (
    <div style={{ paddingTop: `${topbarHeight}px` }} className="min-h-screen">
      {children}
    </div>
  );
};

export default PageWrapper;