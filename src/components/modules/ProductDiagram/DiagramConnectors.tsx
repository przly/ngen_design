import type { CSSProperties } from 'react';
import { memo } from 'react';
import Text from '@/components/atoms/Text/Text';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import cn from '@/utils/cn';
import { connectors, world, type Connector, type ConnectorKey, type Point } from './diagram';

export type ConnectorLabels = Partial<Record<ConnectorKey, { title?: Lcf.Text; text?: Lcf.Text }>>;

const HEAD_SIZE = 7;
// Target world px between pulses; longer connectors carry more.
const PULSE_SPACING = 200;
// The shortest connectors still show two pulses at a time.
const MIN_PULSES = 2;
// World px per second, the same on every connector.
const PULSE_SPEED = 200;

const toneClassName = {
	green: 'text-green-600',
	gray: 'text-gray-500',
	muted: 'text-gray-200',
} satisfies Record<Connector['tone'], string>;

const alignClassName = {
	start: '',
	center: '-translate-x-1/2 text-center',
	end: '-translate-x-full text-right',
};

const span = ([ax, ay]: Point, [bx, by]: Point) => Math.abs(bx - ax) + Math.abs(by - ay);

const direction = ([ax, ay]: Point, [bx, by]: Point): Point => [Math.sign(bx - ax), Math.sign(by - ay)];

// Round caps add a pixel at each end, so the drawn centre line stops a pixel short of the outline.
const inset = (points: Point[]): Point[] => {
	const [startX, startY] = direction(points[0], points[1]);
	const [endX, endY] = direction(points[points.length - 2], points[points.length - 1]);

	return points.map(([x, y], index): Point => {
		if (index === 0) {
			return [x + startX, y + startY];
		}

		return index === points.length - 1 ? [x - endX, y - endY] : [x, y];
	});
};

const linePath = (points: Point[]) => points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join('');

const headPath = (points: Point[]) => {
	const [tipX, tipY] = points[points.length - 1];
	const [dx, dy] = direction(points[points.length - 2], points[points.length - 1]);
	const backX = tipX - dx * HEAD_SIZE;
	const backY = tipY - dy * HEAD_SIZE;

	return `M${backX - dy * HEAD_SIZE} ${backY + dx * HEAD_SIZE}L${tipX} ${tipY}L${backX + dy * HEAD_SIZE} ${backY - dx * HEAD_SIZE}`;
};

const lines = connectors.map((connector) => ({ ...connector, points: inset(connector.points) }));

// Each straight run is its own clipped strip, delayed so a pulse carries on around a corner.
const pulseSegments = lines
	.filter((line) => line.pulses !== false)
	.flatMap((line, lineIndex) => {
		const total = line.points.slice(1).reduce((sum, to, index) => sum + span(line.points[index], to), 0);
		const period = total / Math.max(MIN_PULSES, Math.round(total / PULSE_SPACING));
		const duration = period / PULSE_SPEED;
		// Spread the connectors so they don't all pulse in unison.
		let travelled = lineIndex * period * 0.37;

		return line.points.slice(1).map((to, index) => {
			const from = line.points[index];
			const length = span(from, to);
			const delay = -duration * (1 - (travelled % period) / period);
			travelled += length;

			return {
				key: `${line.key}-${index}`,
				style: {
					left: from[0],
					top: from[1] - 1,
					width: length,
					transform: `rotate(${(Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI}deg)`,
					'--flow-period': `${period}px`,
					'--flow-duration': `${duration}s`,
					'--flow-delay': `${delay}s`,
				} as CSSProperties,
			};
		});
	});

function DiagramConnectors({ labels }: { labels: ConnectorLabels }) {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			<svg
				className="absolute top-0 left-0 overflow-visible"
				width={world.width}
				height={world.height}
				viewBox={`0 0 ${world.width} ${world.height}`}
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{lines.map((line) => (
					<g key={line.key} className={toneClassName[line.tone]} data-connector={line.key}>
						<path d={linePath(line.points)} />
						<path d={headPath(line.points)} />
					</g>
				))}
			</svg>

			{pulseSegments.map((segment) => (
				<div key={segment.key} className="diagram-flow" style={segment.style}>
					<div className="diagram-flow-pulses" />
				</div>
			))}

			{connectors.map((connector) => {
				const label = labels[connector.key];

				return (
					<div key={connector.key}>
						{connector.title && (
							<Text
								className={cn(
									'super-title absolute whitespace-nowrap',
									// .super-title sets its own colour outside the utilities layer.
									connector.tone === 'green' && 'text-green-700!',
									alignClassName[connector.title.align],
								)}
								style={{ left: connector.title.x, top: connector.title.y }}
							>
								{label?.title}
							</Text>
						)}
						{connector.text && (
							<Text
								className={cn(
									'absolute text-xs leading-normal font-medium whitespace-nowrap text-gray-500',
									alignClassName[connector.text.align],
								)}
								style={{ left: connector.text.x, top: connector.text.y }}
							>
								{label?.text}
							</Text>
						)}
					</div>
				);
			})}
		</div>
	);
}

export default memo(DiagramConnectors);
