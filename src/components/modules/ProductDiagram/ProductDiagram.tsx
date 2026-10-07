import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from 'motion/react';
import { useEvent, useKeyPressEvent, useUnmount } from 'react-use';
import Button from '@/components/atoms/Button/Button';
import Icon from '@/components/atoms/Icon/Icon';
import SectionMargin from '@/components/atoms/SectionMargin/SectionMargin';
import Tag from '@/components/atoms/Tag/Tag';
import Text from '@/components/atoms/Text/Text';
import SectionHeader from '@/components/molecules/SectionHeader/SectionHeader';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import cn from '@/utils/cn';
import { appCard, nodeLayout, nodeSize, overlayTransition, world, type ConnectorKey, type NodeKey } from './diagram';
import DiagramConnectors, { type ConnectorLabels } from './DiagramConnectors';
import DiagramGroups from './DiagramGroups';
import DiagramNode, { AppCard, DeviceCards, type DiagramAppProps, type DiagramDeviceProps, type DiagramNodeProps } from './DiagramNode';
import DiagramTooltip from './DiagramTooltip';
import { MAX_ZOOM, MIN_ZOOM, useCanvas } from './useCanvas';
import { useFullscreen } from './useFullscreen';
import './ProductDiagram.css';

export interface ProductDiagramProps {
	super_title?: Lcf.Text;
	title?: Lcf.Textarea;
	text?: Lcf.Textarea;
	tag?: Lcf.Text;
	logo?: Lcf.Image;
	site_tag?: Lcf.Text;
	weather_tag?: Lcf.Text;
	prices_tag?: Lcf.Text;
	nodes: Lcf.Repeater<DiagramNodeProps>;
	app?: Lcf.Object<DiagramAppProps>;
	devices?: Lcf.Repeater<DiagramDeviceProps>;
	connectors?: Lcf.Repeater<{
		slot: Lcf.Select<ConnectorKey>;
		title?: Lcf.Text;
		text?: Lcf.Text;
	}>;
	fullscreen_label?: Lcf.Text;
	exit_fullscreen_label?: Lcf.Text;
	drag_hint?: Lcf.Text;
	zoom_hint?: Lcf.Text;
}

type ProductDiagramParams = ProductDiagramProps;

const INSTRUCTIONS_ID = 'product-diagram-instructions';
const TOOLTIP_CLOSE_DELAY_MS = 120;
const ZOOM_STEP = 1.25;

const readZoom = (scale: number) => ({ zoom: Math.round(scale * 100), atMin: scale <= MIN_ZOOM, atMax: scale >= MAX_ZOOM });

// Only the percentage subscribes to zoom frames; the diagram stays outside React updates.
function ZoomControls({
	scale,
	zoomAt,
	onInteract,
	isOnDark,
}: {
	scale: MotionValue<number>;
	zoomAt: ReturnType<typeof useCanvas>['zoomAt'];
	onInteract: () => void;
	isOnDark: boolean;
}) {
	const [zoomState, setZoomState] = useState(() => readZoom(scale.get()));
	const { zoom, atMin, atMax } = zoomState;

	useMotionValueEvent(scale, 'change', (value) => {
		const next = readZoom(value);
		setZoomState((previous) =>
			previous.zoom === next.zoom && previous.atMin === next.atMin && previous.atMax === next.atMax ? previous : next,
		);
	});

	const zoomTo = (nextScale: number) => {
		onInteract();
		zoomAt(nextScale, undefined, true);
	};

	return (
		<div className="flex cursor-default items-center gap-0.5" role="group" aria-label="Canvas zoom controls">
			<button
				type="button"
				className={cn(
					'focus-visible:outline-focus mr-2 min-w-7.5 cursor-pointer text-right text-xs leading-normal font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 md:mr-3.5 md:min-w-8.75',
					isOnDark ? 'text-white' : 'text-gray-500',
				)}
				aria-label={`Zoom ${zoom} percent. Reset to 100 percent`}
				onClick={() => zoomTo(1)}
			>
				{zoom}%
			</button>
			<Button
				iconOnly
				size="small"
				modifier="white"
				leftIcon="Minus"
				aria-label="Zoom out"
				isDisabled={atMin}
				onClick={() => zoomTo(scale.get() / ZOOM_STEP)}
			/>
			<Button
				iconOnly
				size="small"
				modifier="white"
				leftIcon="Plus"
				aria-label="Zoom in"
				isDisabled={atMax}
				onClick={() => zoomTo(scale.get() * ZOOM_STEP)}
			/>
		</div>
	);
}

function ProductDiagram({
	super_title,
	title,
	text,
	tag,
	logo,
	site_tag,
	weather_tag,
	prices_tag,
	nodes,
	app,
	devices,
	connectors,
	fullscreen_label = 'Fullscreen',
	exit_fullscreen_label = 'Exit fullscreen',
	drag_hint = 'Drag to pan',
	zoom_hint = 'scroll to zoom',
}: ProductDiagramParams) {
	const host = useRef<HTMLDivElement>(null);
	const frame = useRef<HTMLDivElement>(null);
	const { active: isFullscreen, expanded: isExpanded, style: viewportStyle, toggle: toggleFullscreen } = useFullscreen(host, frame);
	const { viewport, x, y, scale, dragging, jumpTo, zoomAt, pinchHint, dismissPinchHint, modifierKey, isMac, handlers } =
		useCanvas(isFullscreen);
	const [info, setInfo] = useState<DiagramNodeProps | null>(null);
	// A click pins the tooltip open; hover and focus only preview it.
	const pinned = useRef(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearClose = useCallback(() => {
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
		}
	}, []);

	const showInfo = useCallback(
		(node: DiagramNodeProps) => {
			clearClose();
			if (!pinned.current) {
				setInfo(node);
			}
		},
		[clearClose],
	);

	const hideInfo = useCallback(() => {
		clearClose();
		if (!pinned.current) {
			closeTimer.current = setTimeout(() => setInfo(null), TOOLTIP_CLOSE_DELAY_MS);
		}
	}, [clearClose]);

	const toggleInfo = useCallback(
		(node: DiagramNodeProps) => {
			clearClose();
			const isPinnedHere = pinned.current && info?.slot === node.slot;
			pinned.current = !isPinnedHere;
			setInfo(isPinnedHere ? null : node);
		},
		[clearClose, info],
	);

	const dismissInfo = useCallback(() => {
		clearClose();
		pinned.current = false;
		setInfo(null);
	}, [clearClose]);

	const focusNode = useCallback((slot: NodeKey) => jumpTo({ ...nodeLayout[slot], ...nodeSize }), [jumpTo]);
	const focusApp = useCallback(() => jumpTo(appCard), [jumpTo]);

	useKeyPressEvent('Escape', dismissInfo);

	// Anything outside the tooltip dismisses it, except panning the canvas while it is pinned.
	useEvent('pointerdown', (event: PointerEvent) => {
		const target = event.target as Element;
		const isPanning = pinned.current && target.closest('[data-diagram-viewport]') && !target.closest('button,a,[data-canvas-controls]');

		if (!target.closest('[data-diagram-info],[data-diagram-tooltip]') && !isPanning) {
			dismissInfo();
		}
	});

	useUnmount(clearClose);

	const labels: ConnectorLabels = Object.fromEntries((connectors ?? []).map(({ slot, ...label }) => [slot, label]));
	const handleZoomInteract = useCallback(() => {
		dismissInfo();
		dismissPinchHint();
	}, [dismissInfo, dismissPinchHint]);

	return (
		<div ref={host} className="bg-white backdrop:bg-white [&:fullscreen]:h-dvh [&:fullscreen]:w-screen">
			<motion.div
				className="container"
				animate={{ opacity: isFullscreen ? 0 : 1 }}
				transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
			>
				<SectionHeader with_padding super_title={super_title} title={title} text={text} title_tag="h2" />
			</motion.div>

			<div className="container-large mt-8 lg:mt-12">
				<div ref={frame} className="relative h-[min(80svh,56rem)] min-h-120 [--canvas-radius:1.75rem] md:[--canvas-radius:2.25rem]">
					<motion.div
						ref={viewport}
						data-diagram-viewport
						style={viewportStyle}
						// overflow-clip, not hidden: a scroll container would scroll itself when a node off-screen takes focus.
						className={cn(
							'focus-visible:outline-focus relative isolate size-full min-h-0 cursor-grab touch-pan-x touch-pan-y overflow-clip border-[0.5px] border-gray-200 bg-gray-50 contain-[layout_paint] outline-none select-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:-outline-offset-2',
							isFullscreen && 'touch-none',
							dragging && 'cursor-grabbing',
							isExpanded && 'fixed z-80',
						)}
						tabIndex={0}
						role="region"
						aria-label="Interactive product diagram"
						aria-describedby={INSTRUCTIONS_ID}
						{...handlers}
					>
						<div className="absolute top-4 left-4 z-2 flex cursor-default md:top-5.5 md:left-5.5" data-canvas-controls>
							<Tag title={tag} icon="Hub" icon_size="small" modifier="green" />
						</div>

						<Button
							size="small"
							modifier="white"
							rightIcon={isFullscreen ? 'FullscreenExit' : 'Fullscreen'}
							className="absolute top-4 right-4 z-2 md:top-4.25 md:right-4.25"
							data-canvas-controls
							aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
							aria-pressed={isFullscreen}
							onClick={() => {
								dismissInfo();
								void toggleFullscreen();
							}}
						>
							{isFullscreen ? exit_fullscreen_label : fullscreen_label}
						</Button>

						<motion.div className="absolute size-0" style={{ left: x, top: y }}>
							{/* Keep one uniform scale, without a persistent compositing hint that caches a low-resolution surface. */}
							<motion.div
								className="absolute top-0 left-0 origin-top-left text-sm leading-normal [text-size-adjust:none]"
								style={{ width: world.width, height: world.height, scale }}
							>
								<DiagramGroups logo={logo} site_tag={site_tag} weather_tag={weather_tag} prices_tag={prices_tag} />
								<DiagramConnectors labels={labels} />
								{nodes.map((node) => (
									<DiagramNode
										key={node.slot}
										node={node}
										isInfoOpen={info?.slot === node.slot}
										onInfo={showInfo}
										onInfoLeave={hideInfo}
										onInfoToggle={toggleInfo}
										onFocusNode={focusNode}
									/>
								))}
								{app && <AppCard {...app} onFocusNode={focusApp} />}
								{devices && <DeviceCards devices={devices} />}
							</motion.div>

							<AnimatePresence>
								{info && !dragging ? (
									<DiagramTooltip
										key={info.slot}
										node={info}
										viewport={viewport}
										x={x}
										y={y}
										scale={scale}
										onEnter={clearClose}
										onLeave={hideInfo}
									/>
								) : null}
							</AnimatePresence>
						</motion.div>

						<AnimatePresence>
							{pinchHint && !isFullscreen ? (
								<motion.div
									className="pointer-events-none absolute inset-1.5 z-1 flex items-center justify-center rounded-[calc(var(--canvas-radius)-0.375rem)] bg-black/40 p-6"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={overlayTransition}
								>
									<div className="flex flex-none scale-50 items-center gap-3 md:scale-100" role="status">
										{isMac && <Icon icon="Command" className="size-9 flex-none text-white" aria-hidden="true" />}
										<Text className="text-5xl leading-none font-medium tracking-[-0.03em] whitespace-nowrap text-white">
											{`${modifierKey} + ${zoom_hint}`}
										</Text>
									</div>
								</motion.div>
							) : null}
						</AnimatePresence>

						<div
							className="pointer-events-none absolute right-4 bottom-4 left-5 z-2 flex items-center justify-between gap-3 md:right-4.25 md:left-7.5"
							data-canvas-controls
						>
							<div
								id={INSTRUCTIONS_ID}
								className={cn(
									'pointer-events-auto flex max-w-41 cursor-default flex-wrap items-center gap-x-6 text-xs leading-normal font-medium md:max-w-none',
									pinchHint ? 'text-white' : 'text-gray-500',
								)}
							>
								<Text as="span" className="whitespace-nowrap">
									{drag_hint}
								</Text>
								<span className="inline-flex items-center gap-1.5">
									{isMac && <Icon icon="Command" className="size-2.5 flex-none" aria-hidden="true" />}
									<Text as="span" className="whitespace-nowrap">{`${modifierKey} + ${zoom_hint}`}</Text>
								</span>
							</div>
							<div className="pointer-events-auto">
								<ZoomControls scale={scale} zoomAt={zoomAt} onInteract={handleZoomInteract} isOnDark={pinchHint} />
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			<SectionMargin size="default" />
		</div>
	);
}

export default ProductDiagram;
