import type React from 'react';
import { icons } from './IconVariants';
import cn from '@/utils/cn';
import './Icon.css';

export interface IconProps {
	icon: keyof typeof icons;
	svgProps?: React.SVGProps<SVGSVGElement>;
}

type IconParams = IconProps & React.HTMLAttributes<HTMLDivElement>;

const Icon = ({ icon, className, svgProps, ...props }: IconParams) => {
	const SvgIcon = icons[icon] as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;

	// oxlint-disable-next-line
	if (!SvgIcon) {
		throw new Error(`Icon "${icon}" not found`);
	}

	return (
		<div aria-label={icon} className={cn(['icon relative block', className, icon])} role="img" {...props}>
			<SvgIcon {...svgProps} className="h-auto w-full" height="100%" width="100%" />
		</div>
	);
};

export default Icon;
