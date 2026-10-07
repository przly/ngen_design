import type React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import cn from '@/utils/cn';

export interface MarginProps {
	modifier?: VariantProps<typeof marginStyles>['modifier'];
}

type MarginParams = MarginProps & React.HTMLAttributes<HTMLDivElement>;

const marginStyles = tv({
	base: 'block w-full',
	variants: {
		modifier: {
			'0': 'h-0',
			'24': 'h-6',
			'32': 'h-4 lg:h-8',
			'48': 'h-6 md:h-8 lg:h-12',
			'50': 'h-8 lg:h-12.5',
			'80': 'h-16 lg:h-20',
			'96': 'h-16 lg:h-20 xl:h-24',
			'128': 'h-16 lg:h-20 xl:h-24 2xl:h-32',
			'160': 'h-24 md:h-32 lg:h-40',
			'200': 'h-40 lg:h-50',
			'240': 'h-40 lg:h-60',
			'280': 'h-40 lg:h-70',
		},
	},
	defaultVariants: {
		modifier: '0',
	},
});

function Margin({ modifier, className, ...props }: MarginParams) {
	if (!modifier) {
		return null;
	}

	return <div className={cn(marginStyles({ modifier }), className)} tabIndex={-1} {...props} />;
}

export default Margin;
