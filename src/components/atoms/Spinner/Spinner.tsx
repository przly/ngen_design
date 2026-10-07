import type React from 'react';
import cn from '@/utils/cn';
import './Spinner.css';
import type { CSSProperties } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

export interface SpinnerProps {
	modifier?: VariantProps<typeof spinnerStyles>['modifier'];
	isVisible?: boolean | undefined;
	size?: number;
}

type SpinnerParams = SpinnerProps & React.HTMLAttributes<HTMLDivElement>;

const bars = new Array(12).fill(0);

const spinnerStyles = tv({
	base: 'm-1 bg-black',
	variants: {
		modifier: {},
	},
});

function Spinner({ className, isVisible = true, size = 18, modifier, style, ...props }: SpinnerParams) {
	if (!isVisible) {
		return null;
	}

	return (
		<div className={cn(['spinner-wrapper', className])} style={{ ...style, '--spinner-size': `${size}px` } as CSSProperties} {...props}>
			<div className="spinner-bars">
				{bars.map((_, i) => (
					<div className={cn(['bar', spinnerStyles({ modifier })])} key={`spinner-bar-${i}`} />
				))}
			</div>
		</div>
	);
}

export default Spinner;
