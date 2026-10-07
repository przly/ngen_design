import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import Text from '@/components/atoms/Text/Text';
import Title from '@/components/atoms/Title/Title';
import { nodeLayout, nodeSize, overlayTransition } from './diagram';
import { TOOLTIP_ID, type DiagramNodeProps } from './DiagramNode';

interface DiagramTooltipParams {
	node: DiagramNodeProps;
	viewport: RefObject<HTMLDivElement | null>;
	x: MotionValue<number>;
	y: MotionValue<number>;
	scale: MotionValue<number>;
	onEnter: () => void;
	onLeave: () => void;
}

const GAP = 12;
const EDGE = 12;

// Lives in the unscaled pan layer, so it stays at 100% size at any zoom; only its anchor follows the node.
function DiagramTooltip({ node, viewport, x, y, scale, onEnter, onLeave }: DiagramTooltipParams) {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	const layout = nodeLayout[node.slot];

	// The clamps below need the rendered size before the first paint.
	useLayoutEffect(() => {
		if (ref.current) {
			setSize({ width: ref.current.offsetWidth, height: ref.current.offsetHeight });
		}
	}, []);

	// Sits beside the node, flipping to its left when the right side would leave the canvas.
	const left = useTransform(() => {
		const pan = x.get();
		const right = (layout.x + nodeSize.width) * scale.get() + GAP;
		const flipped = layout.x * scale.get() - GAP - size.width;
		const limit = (viewport.current?.clientWidth ?? Infinity) - EDGE;

		return pan + right + size.width > limit && pan + flipped >= EDGE ? flipped : right;
	});

	// Aligned to the node's top, nudged to stay inside the canvas.
	const top = useTransform(() => {
		const pan = y.get();
		const limit = (viewport.current?.clientHeight ?? Infinity) - EDGE - size.height;

		return Math.max(EDGE, Math.min(limit, pan + layout.y * scale.get())) - pan;
	});

	return (
		<motion.div
			ref={ref}
			id={TOOLTIP_ID}
			role="tooltip"
			data-canvas-controls
			data-diagram-tooltip
			className="absolute z-20 flex w-90.25 cursor-default flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_13px_4px_rgb(0_0_0/0.01),0_6px_3px_rgb(0_0_0/0.02),0_1px_1.5px_rgb(0_0_0/0.03)]"
			style={{ left, top }}
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 8 }}
			transition={overlayTransition}
			onPointerEnter={onEnter}
			onPointerLeave={onLeave}
		>
			<Title tag="h4" modifier="h5" titleClassName="text-xl! leading-tight! tracking-tight! text-gray-900!" title={node.title} />
			<Text className="text-sm leading-normal text-gray-500">{node.detail}</Text>
		</motion.div>
	);
}

export default DiagramTooltip;
