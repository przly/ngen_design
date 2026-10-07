import Margin, { type MarginProps } from '@/components/atoms/Margin/Margin';

export interface SectionMarginProps {
	size: keyof typeof margin | undefined;
}

const margin: Record<string, MarginProps['modifier'] | undefined> = {
	default: '280',
	large: '240',
	medium: '200',
	small: '80',
	extraSmall: '50',
	none: '0',
};

function SectionMargin({ size }: SectionMarginProps) {
	if (!size || size === 'none') {
		return null;
	}

	return <Margin modifier={margin[size]} />;
}

export default SectionMargin;
