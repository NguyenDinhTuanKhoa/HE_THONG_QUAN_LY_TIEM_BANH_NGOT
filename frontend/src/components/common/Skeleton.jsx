import React from 'react';

const shimmer = `@keyframes shimmer{0%{background-position:-468px 0}100%{background-position:468px 0}}`;

const baseStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '936px 100%',
  animation: 'shimmer 1.4s infinite linear',
  borderRadius: '6px',
};

export const Skeleton = ({ width = '100%', height = '16px', style = {}, borderRadius }) => (
  <>
    <style>{shimmer}</style>
    <div style={{ ...baseStyle, width, height, borderRadius: borderRadius || baseStyle.borderRadius, ...style }} />
  </>
);

export const SkeletonProductCard = () => (
  <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
    <style>{shimmer}</style>
    <div style={{ ...baseStyle, height: '220px', borderRadius: '12px 12px 0 0' }} />
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ ...baseStyle, height: '20px', width: '70%' }} />
      <div style={{ ...baseStyle, height: '14px', width: '90%' }} />
      <div style={{ ...baseStyle, height: '14px', width: '60%' }} />
      <div style={{ ...baseStyle, height: '24px', width: '40%' }} />
      <div style={{ ...baseStyle, height: '42px', borderRadius: '8px' }} />
    </div>
  </div>
);

export const SkeletonProductGrid = ({ count = 6, columns = 'repeat(auto-fill, minmax(240px, 1fr))' }) => (
  <div style={{ display: 'grid', gridTemplateColumns: columns, gap: '24px' }}>
    {Array.from({ length: count }, (_, i) => <SkeletonProductCard key={i} />)}
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <style>{shimmer}</style>
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} style={{ ...baseStyle, height: '14px', width: i === lines - 1 ? '60%' : '100%' }} />
    ))}
  </div>
);

export default Skeleton;
