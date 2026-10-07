import { type ImgHTMLAttributes, type RefObject, useState } from 'react';
import Text from '@/components/atoms/Text/Text';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import cn from '@/utils/cn';

export interface ImgProps {
	ref?: RefObject<HTMLImageElement>;
	wrapperClassName?: string;
	imgClassName?: string;
	width: ImgHTMLAttributes<HTMLImageElement>['width'];
	height: ImgHTMLAttributes<HTMLImageElement>['height'];
	/** Breakpoint (max-width) at which the mobile image is used. Defaults to 768px. */
	mobileBreakpoint?: number;
}

type ImgParams = ImgProps & Lcf.Image & Omit<ImgHTMLAttributes<HTMLImageElement>, 'id' | 'className'>;

const isStorybook = import.meta.env.STORYBOOK === 'true' || import.meta.env.STORYBOOK_ENV === 'preview';
const sizes = '(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 1280px, 100vw';

const TinyPlaceholder = ({ isLoaded, height, width, tiny }: Pick<ImgParams, 'height' | 'width' | 'tiny'> & { isLoaded: boolean }) => {
	if (!tiny) {
		return null;
	}

	return (
		// oxlint-disable-next-line react/forbid-elements
		<img
			alt=""
			className={cn(
				'pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[0.4s] ease-in-out',
				isLoaded ? 'opacity-0' : 'opacity-100',
			)}
			draggable={false}
			height={height}
			loading="eager"
			src={`data:image/webp;base64,${tiny}`}
			width={width}
		/>
	);
};

function Img({
	ref,
	wrapperClassName,
	imgClassName,
	id,
	src,
	width,
	height,
	loading: loadingProp,
	caption,
	srcSet,
	tiny,
	mobile,
	mobileBreakpoint = 768,
	...props
}: ImgParams) {
	const loading = isStorybook ? 'eager' : loadingProp || 'lazy';
	const mobileMediaQuery = `(max-width: ${String(mobileBreakpoint)}px)`;
	const [isLoaded, setIsLoaded] = useState(!tiny || loading === 'eager');

	const handleLoad = () => {
		setIsLoaded(true);
	};

	if (!(width && height)) {
		throw new Error('Img: width and height are required');
	}

	const imgElement = (
		// oxlint-disable-next-line react/forbid-elements
		<img
			alt={typeof props.alt === 'string' ? props.alt : ''}
			className={cn(
				'relative object-cover transition-opacity duration-300 ease-in-out',
				isLoaded ? 'opacity-100' : 'opacity-0',
				imgClassName,
			)}
			data-media-id={id}
			draggable={false}
			height={height}
			loading={loading}
			onError={handleLoad}
			onLoad={handleLoad}
			ref={ref}
			sizes={srcSet ? sizes : undefined}
			src={src}
			srcSet={srcSet}
			width={width}
			{...props}
		/>
	);

	return (
		<div className={cn('relative w-full', wrapperClassName)}>
			<TinyPlaceholder height={height} isLoaded={isLoaded} tiny={tiny} width={width} />

			{mobile?.src ? (
				<picture>
					<source media={mobileMediaQuery} sizes={sizes} srcSet={mobile.srcSet ?? mobile.src} />
					{imgElement}
				</picture>
			) : (
				imgElement
			)}
			<Text className="mt-3 text-xs leading-normal text-gray-500">{caption}</Text>
		</div>
	);
}

export default Img;
