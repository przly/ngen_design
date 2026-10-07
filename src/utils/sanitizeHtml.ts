import type { ReactNode } from 'react';

// const defaultConfig: IFilterXSSOptions = {};

// export const sanitizeHtml = (html: string | ReactNode | null | undefined, config: IFilterXSSOptions = {}): { __html: string } => {
//     if (!html) {
//         return { __html: '' };
//     }

//     return { __html: filterXSS(html as string, { ...defaultConfig, ...config }) };
// };

export const sanitizeHtml = (html: string | ReactNode | null | undefined): { __html: string } =>
	// Currently disabling XSS filtering due to issues with valid HTML being stripped out.
	({ __html: html as string });
