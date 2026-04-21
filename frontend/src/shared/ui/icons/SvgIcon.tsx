import type { CSSProperties, HTMLAttributes } from 'react';

type SvgIconProps = HTMLAttributes<HTMLSpanElement> & {
  svg: string;
  size?: number;
  title?: string;
};

export function SvgIcon({
  svg,
  size = 24,
  title,
  className,
  style,
  ...props
}: SvgIconProps) {
  const mergedStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    lineHeight: 0,
    color: 'currentColor',
    ...style,
  };

  return (
    <span
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      style={mergedStyle}
      dangerouslySetInnerHTML={{ __html: svg }}
      {...props}
    />
  );
}

type IconComponentProps = Omit<SvgIconProps, 'svg'>;

export function createSvgIcon(svg: string) {
  return function IconComponent(props: IconComponentProps) {
    return <SvgIcon svg={svg} {...props} />;
  };
}
