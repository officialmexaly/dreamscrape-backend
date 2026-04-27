'use client';

import { InlineWidget } from 'react-calendly';

interface CalendlyEmbedProps {
  url: string;
  styles?: React.CSSProperties;
}

export default function CalendlyEmbed({ url, styles }: CalendlyEmbedProps) {
  return (
    <InlineWidget
      url={url}
      styles={{
        height: '700px',
        minWidth: '320px',
        ...styles,
      }}
    />
  );
}
