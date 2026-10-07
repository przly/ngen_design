import React from 'react';
import './Text.css';
import cn from '@/utils/cn';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

export interface TextProps {
	children: React.ReactNode;
	as?: React.ElementType;
}

type TextParams = TextProps & React.HTMLAttributes<HTMLSpanElement>;

function Text({ children, className, as = 'div', ...props }: TextParams) {
	const Element = as;

	if (!children) {
		return null;
	}

	if (React.isValidElement(children)) {
		throw new Error('Text component cannot contain react components');
	}

	return (
		<Element
			className={cn('editor-text', className)}
			dangerouslySetInnerHTML={sanitizeHtml(Array.isArray(children) ? children.join('') : children)}
			{...props}
		/>
	);
}

export default Text;
