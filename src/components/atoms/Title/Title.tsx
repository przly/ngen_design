import type { HTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

// Go to styles/headings.css to change modifier styles

const titleStyles = tv({
	base: 'heading font-zero',
	variants: {
		modifier: {
			h1: 'heading-1',
			h2: 'heading-2',
			h3: 'heading-3',
			h4: 'heading-4',
			h5: 'heading-5',
			h6: 'heading-6',
		},
		weight: {
			black: 'font-black',
			bold: 'font-bold',
			extralight: 'font-extralight',
			light: 'font-light',
			medium: 'font-medium',
			normal: 'font-normal',
			thin: 'font-thin',
		},
	},
	defaultVariants: {
		modifier: 'h2',
		weight: 'medium',
	},
});

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
	tag?: Lcf.Select<VariantProps<typeof titleStyles>['modifier']>;
	modifier?: Lcf.Select<VariantProps<typeof titleStyles>['modifier']>;
	title?: Lcf.Text;
	weight?: VariantProps<typeof titleStyles>['weight'];
	titleClassName?: string;
}

function Title({ tag: Tag = 'h2', modifier, titleClassName, weight, title, ...props }: TitleProps) {
	if (!title) {
		return null;
	}

	return (
		<Tag className={titleStyles({ modifier, weight, class: titleClassName })} dangerouslySetInnerHTML={sanitizeHtml(title)} {...props} />
	);
}

export default Title;
