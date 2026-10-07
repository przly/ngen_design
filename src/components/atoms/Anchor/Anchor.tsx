import { Link as InertiaLink, type InertiaLinkProps } from '@inertiajs/react';
import type React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import { getWindow } from '@/utils/browser';
import { scrollToFragment } from '@/utils/scrollToFragment';
import type { AnchorHTMLAttributes } from 'react';

export interface AnchorProps {
	modifier?: VariantProps<typeof anchorStyles>['modifier'];
	children?: React.ReactNode;
	className?: string;
}

type AnchorParams = AnchorProps & Lcf.Link & InertiaLinkProps;

const anchorStyles = tv({
	base: 'group relative',
	variants: {
		modifier: {},
	},
});

const getUrl = (href: AnchorParams['href']) => {
	try {
		if (!href) {
			return null;
		}
		return new URL(href, getWindow().location.origin);
	} catch {
		return null;
	}
};

const checkIsExternal = (href: AnchorParams['href'], target: AnchorParams['target']) => {
	if (target === '_blank') {
		return true;
	}

	const url = getUrl(href);
	return url ? url.origin !== getWindow().location.origin : false;
};

const isSameLink = (href: AnchorParams['href']) => {
	const url = getUrl(href);
	return url ? url.pathname === getWindow().location.pathname : false;
};

function Anchor({ modifier, className, children, title, target, href, viewTransition, download, onClick, ...props }: AnchorParams) {
	const styles = anchorStyles({ modifier, className });
	const content = children || title;
	const isExternal = checkIsExternal(href, target);
	const isDownload = download !== undefined && download !== false;

	const handleClick: NonNullable<InertiaLinkProps['onClick']> = (event) => {
		onClick?.(event);
		if (!props.method || props.method.toLowerCase() === 'get') {
			scrollToFragment(event);
		}
	};

	if (!href) {
		return <span className={className}>{content}</span>;
	}

	if (isExternal || href.startsWith('#') || isDownload) {
		return (
			// oxlint-disable-next-line react/forbid-elements
			<a
				className={styles}
				href={href}
				target={target}
				{...(isDownload && { download })}
				{...(isExternal && {
					rel: 'noreferrer',
					target: target ?? '_blank',
				})}
				{...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
				onClick={handleClick}
			>
				{content}
			</a>
		);
	}

	return (
		<InertiaLink
			className={styles}
			href={href}
			preserveScroll={false}
			target={target}
			{...props}
			onClick={handleClick}
			viewTransition={isSameLink(href) ? false : (viewTransition ?? true)}
		>
			{content}
		</InertiaLink>
	);
}

export default Anchor;
