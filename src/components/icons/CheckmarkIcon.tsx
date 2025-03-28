import { ComponentProps } from 'react';

const CheckmarkIcon = (props: ComponentProps<'svg'>) => (
  <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M9.5 12.1316L11.7414 14.5L16 10M20.5 12.5C20.5 16.9183 16.9183 20.5 12.5 20.5C8.08172 20.5 4.5 16.9183 4.5 12.5C4.5 8.08172 8.08172 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5Z"
      strokeWidth="1.5"
    />
  </svg>
);

export default CheckmarkIcon;
