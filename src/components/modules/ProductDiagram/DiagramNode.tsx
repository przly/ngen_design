import type { FocusEvent, PointerEvent } from 'react';
import { memo } from 'react';
import { tv } from 'tailwind-variants';
import Anchor from '@/components/atoms/Anchor/Anchor';
import Button from '@/components/atoms/Button/Button';
import Icon from '@/components/atoms/Icon/Icon';
import Img from '@/components/atoms/Img/Img';
import Text from '@/components/atoms/Text/Text';
import Title from '@/components/atoms/Title/Title';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import { appCard, appLogoCrop, deviceSlots, nodeLayout, type NodeKey } from './diagram';

export interface DiagramNodeProps {
	slot: Lcf.Select<NodeKey>;
	title: Lcf.Text;
	text?: Lcf.Text;
	detail?: Lcf.Textarea;
	image?: Lcf.Image;
	button?: Lcf.Link;
}

export interface DiagramAppProps {
	title: Lcf.Text;
	image?: Lcf.Image;
	logo?: Lcf.Image;
	features?: Lcf.Repeater<{ text: Lcf.Text }>;
	button?: Lcf.Link;
}

export interface DiagramDeviceProps {
	title: Lcf.Text;
	image?: Lcf.Image;
}

interface DiagramNodeParams {
	node: DiagramNodeProps;
	isInfoOpen: boolean;
	onInfo: (node: DiagramNodeProps) => void;
	onInfoLeave: () => void;
	onInfoToggle: (node: DiagramNodeProps) => void;
	onFocusNode: (key: NodeKey) => void;
}

export const TOOLTIP_ID = 'product-diagram-tooltip';

const nodeStyles = tv({
	slots: {
		root: 'absolute flex h-51 w-150 items-center gap-3 rounded-3xl border-[0.5px] border-gray-200 bg-white p-3',
		copy: 'flex min-w-0 flex-auto flex-col items-start justify-between self-stretch p-5',
		title: 'text-2xl! leading-tight! tracking-tight! text-gray-900!',
		text: 'mt-1.5 text-sm leading-normal font-medium text-gray-500',
	},
	variants: {
		variant: {
			white: {},
			green: {
				root: 'gap-2 border-green-300 bg-green-600',
				copy: 'justify-center gap-6',
				title: 'text-green-900!',
				text: 'text-green-800',
			},
			dark: {
				root: 'gap-2 border-gray-700 bg-gray-900',
				title: 'text-white!',
			},
		},
		hasButton: {
			false: {
				copy: 'justify-center gap-5',
			},
		},
	},
});

function DiagramNode({ node, isInfoOpen, onInfo, onInfoLeave, onInfoToggle, onFocusNode }: DiagramNodeParams) {
	const layout = nodeLayout[node.slot];
	const styles = nodeStyles({ variant: layout.variant, hasButton: Boolean(node.button?.href) });

	const handlePointerEnter = (event: PointerEvent) => {
		if (event.pointerType === 'mouse') {
			onInfo(node);
		}
	};

	// Only keyboard focus moves the camera; a click must not pull the node away from the pointer.
	const handleFocus = (event: FocusEvent) => {
		if (event.target.matches(':focus-visible')) {
			onFocusNode(node.slot);
		}
	};

	const handleInfoFocus = (event: FocusEvent) => {
		handleFocus(event);
		onInfo(node);
	};

	return (
		<article className={styles.root()} data-product={node.slot} style={{ left: layout.x, top: layout.y }}>
			{node.image?.src && (
				<Img
					{...node.image}
					alt=""
					height={180}
					width={180}
					loading="eager"
					wrapperClassName="size-45 flex-none overflow-hidden rounded-xl"
					imgClassName="absolute max-w-none"
					style={layout.crop}
				/>
			)}

			<div className={styles.copy()}>
				<div className="w-full flex-none">
					<Title tag="h3" modifier="h5" titleClassName={styles.title()} title={node.title} />
					<Text className={styles.text()}>{node.text}</Text>
				</div>

				{node.button?.href && (
					<Button asChild size="small" modifier={layout.variant === 'green' ? 'secondary' : 'primary'} rightIcon="ArrowRight">
						<Anchor {...node.button} onFocus={handleFocus} />
					</Button>
				)}
			</div>

			{node.detail && (
				<Button
					iconOnly
					size="small"
					modifier={layout.variant === 'dark' ? 'white' : 'secondary'}
					leftIcon="QuestionMark"
					className="absolute top-2 right-2"
					data-diagram-info
					aria-label={`About ${node.title}`}
					aria-expanded={isInfoOpen}
					aria-describedby={isInfoOpen ? TOOLTIP_ID : undefined}
					onPointerEnter={handlePointerEnter}
					onPointerLeave={onInfoLeave}
					onFocus={handleInfoFocus}
					onBlur={onInfoLeave}
					onClick={() => onInfoToggle(node)}
				/>
			)}
		</article>
	);
}

function DiagramAppCard({ title, image, logo, features, button, onFocusNode }: DiagramAppProps & { onFocusNode: () => void }) {
	const handleFocus = (event: FocusEvent) => {
		if (event.target.matches(':focus-visible')) {
			onFocusNode();
		}
	};

	return (
		<article
			className="absolute flex h-82.5 w-225 gap-3 rounded-[2.25rem] border-[0.5px] border-gray-100 bg-white p-3"
			data-product="app"
			style={{ left: appCard.x, top: appCard.y }}
		>
			<div className="relative size-76.5 flex-none overflow-hidden rounded-3xl">
				{image?.src && (
					<Img {...image} alt="" height={306} width={306} loading="eager" wrapperClassName="size-full" imgClassName="size-full" />
				)}
				{logo?.src && (
					<Img
						{...logo}
						alt=""
						height={160}
						width={160}
						loading="eager"
						wrapperClassName="absolute top-1/2 left-1/2 size-40 -translate-1/2 overflow-hidden rounded-[2.3125rem]"
						imgClassName="absolute max-w-none"
						style={appLogoCrop}
					/>
				)}
			</div>

			<div className="flex min-w-0 flex-auto flex-col items-start justify-center gap-8 p-5">
				<Title tag="h3" modifier="h5" titleClassName="w-full text-2xl! leading-tight! tracking-tight! text-gray-900!" title={title} />

				{features && features.length > 0 && (
					<ul className="grid w-129.5 list-none grid-cols-2 border-b border-gray-100">
						{features.map((feature, index) => (
							<li key={index} className="flex h-11.25 items-center gap-2.5 border-t border-gray-100 text-sm leading-normal text-gray-500">
								<Icon icon="Checkmark" className="size-3 flex-none text-green-600" aria-hidden="true" />
								<Text>{feature.text}</Text>
							</li>
						))}
					</ul>
				)}

				{button?.href && (
					<Button asChild size="small" rightIcon="ArrowRight">
						<Anchor {...button} onFocus={handleFocus} />
					</Button>
				)}
			</div>
		</article>
	);
}

function DiagramDeviceCards({ devices }: { devices: Lcf.Repeater<DiagramDeviceProps> }) {
	return (
		<>
			{devices.slice(0, deviceSlots.length).map((device, index) => {
				const slot = deviceSlots[index];

				return (
					<div
						key={index}
						className="absolute flex h-35.25 flex-col items-center gap-0.5 rounded-3xl border-[0.5px] border-gray-200 bg-white pt-3.75"
						style={{ left: slot.x, top: slot.y, width: slot.width }}
					>
						{device.image?.src && (
							<Img
								{...device.image}
								alt=""
								height={88}
								width={88}
								loading="eager"
								wrapperClassName="size-22 flex-none overflow-hidden rounded-xl"
								imgClassName="absolute max-w-none"
								style={slot.crop}
							/>
						)}
						<Text className="text-sm leading-normal font-medium whitespace-nowrap text-gray-500">{device.title}</Text>
					</div>
				);
			})}
		</>
	);
}

export const AppCard = memo(DiagramAppCard);
export const DeviceCards = memo(DiagramDeviceCards);

export default memo(DiagramNode);
