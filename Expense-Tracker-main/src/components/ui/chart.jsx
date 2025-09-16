// Simple chart component for plain JavaScript
import React from 'react';

export function ChartContainer({ children, className, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function ChartTooltip({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function ChartTooltipContent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function ChartLegend({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function ChartLegendContent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}