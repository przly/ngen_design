import type { CSSProperties } from 'react';

// Fixed Figma coordinates. The whole world is scaled as one layer by the canvas camera.

export type Point = [x: number, y: number];

export type NodeKey = 'markets' | 'aggregator' | 'vpp' | 'brain' | 'supply' | 'synaptic' | 'home';
export type NodeVariant = 'white' | 'green' | 'dark';

export type ConnectorKey =
	| 'chooses_market'
	| 'activation_signal'
	| 'control'
	| 'vpp_live_data'
	| 'brain_live_data'
	| 'optimal_plan'
	| 'electricity_prices'
	| 'dispatch'
	| 'aggregated_power'
	| 'device_dispatch'
	| 'device_power'
	| 'metering'
	| 'rewards_aggregator'
	| 'supply_contract'
	| 'rewards_site'
	| 'weather'
	| 'prices';
export type ConnectorTone = 'green' | 'gray' | 'muted';

export type GroupTagKey = 'site' | 'weather' | 'prices';

interface LabelAnchor {
	x: number;
	y: number;
	// Which edge of the text sits on x, so longer translations grow away from the line.
	align: 'start' | 'center' | 'end';
}

export interface Connector {
	key: ConnectorKey;
	tone: ConnectorTone;
	// Centre line from the tail to the tip of the arrowhead.
	points: Point[];
	title?: LabelAnchor;
	text?: LabelAnchor;
	// Stubs are shorter than a single pulse.
	pulses?: boolean;
}

export const world = { width: 4980, height: 4579 };
// Shared by the overlays that fade in over the canvas: the node tooltip and the zoom hint.
export const overlayTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as const;

export const diagramBounds = { x: 400, y: 510, width: 4180, height: 3789 };

export const nodeSize = { width: 600, height: 204 };
export const appCard = { x: 2040, y: 2048, width: 900, height: 330 };

// Crops are tuned to the supplied artwork, which is exported uncropped.
export const nodeLayout: Record<NodeKey, { x: number; y: number; variant: NodeVariant; crop: CSSProperties }> = {
	markets: { x: 800, y: 600, variant: 'white', crop: { width: '195.79%', height: '100%', left: '-53%', top: '0' } },
	aggregator: { x: 2190, y: 600, variant: 'dark', crop: { width: '215.56%', height: '124.04%', left: '-57.78%', top: '-8.01%' } },
	vpp: { x: 2190, y: 1324, variant: 'green', crop: { width: '195.79%', height: '100%', left: '-53%', top: '0' } },
	brain: { x: 800, y: 2111, variant: 'green', crop: { width: '235.93%', height: '145.56%', left: '-67.97%', top: '-23.89%' } },
	supply: { x: 3580, y: 2111, variant: 'white', crop: { width: '440%', height: '253.19%', left: '-170%', top: '-72.75%' } },
	synaptic: { x: 2190, y: 2898, variant: 'white', crop: { width: '100%', height: '100%', left: '0', top: '0' } },
	home: { x: 2190, y: 3622, variant: 'white', crop: { width: '142.15%', height: '82.15%', left: '-14.93%', top: '8.93%' } },
};

export const appLogoCrop: CSSProperties = { width: '117.78%', height: '114.44%', left: '-7.78%', top: '-7.78%' };

// Device cards under "Your Home or Business", left to right.
export const deviceSlots: { x: number; y: number; width: number; crop: CSSProperties }[] = [
	{ x: 2190, y: 3838, width: 139, crop: { width: '713.64%', height: '440.27%', left: '-306.82%', top: '-165.75%' } },
	{ x: 2344, y: 3838, width: 139, crop: { width: '463.64%', height: '286.04%', left: '-181.82%', top: '-86.71%' } },
	{ x: 2498, y: 3838, width: 138, crop: { width: '454.15%', height: '251.14%', left: '-177.08%', top: '-60.56%' } },
	{ x: 2651, y: 3838, width: 139, crop: { width: '546.3%', height: '279.02%', left: '-223.15%', top: '-123.94%' } },
];

export const connectGroup = { x: 480, y: 1164, width: 4020, height: 3055 };
export const siteGroup = { x: 600, y: 1888, width: 3780, height: 2211 };

// Weather and Prices are centred on the stubs that drop from them into SG Brain.
export const groupTags: Record<GroupTagKey, { x: number; y: number; centered?: boolean }> = {
	site: { x: 610, y: 1898 },
	weather: { x: 962, y: 1947, centered: true },
	prices: { x: 1239, y: 1947, centered: true },
};

export const connectors: Connector[] = [
	{
		key: 'chooses_market',
		tone: 'green',
		points: [
			[1480, 702],
			[2111, 702],
		],
		title: { x: 1795, y: 667, align: 'center' },
	},
	{
		key: 'activation_signal',
		tone: 'green',
		points: [
			[2490, 884],
			[2490, 1245],
		],
		title: { x: 2529, y: 1058, align: 'start' },
	},
	{
		key: 'control',
		tone: 'green',
		points: [
			[2623, 1608],
			[2623, 1969],
		],
		title: { x: 2662, y: 1782, align: 'start' },
	},
	{
		key: 'vpp_live_data',
		tone: 'muted',
		points: [
			[2341, 1968],
			[2341, 1607],
		],
		title: { x: 2321, y: 1782, align: 'end' },
	},
	{
		key: 'brain_live_data',
		tone: 'muted',
		points: [
			[1480, 2182],
			[1961, 2182],
		],
		title: { x: 1720, y: 2147, align: 'center' },
	},
	{
		key: 'optimal_plan',
		tone: 'green',
		points: [
			[1960, 2244],
			[1479, 2244],
		],
		title: { x: 1720, y: 2267, align: 'center' },
	},
	{
		key: 'electricity_prices',
		tone: 'gray',
		points: [
			[3500, 2213],
			[3019, 2213],
		],
		title: { x: 3260, y: 2178, align: 'center' },
		text: { x: 3260, y: 2228, align: 'center' },
	},
	{
		key: 'dispatch',
		tone: 'green',
		points: [
			[2623, 2458],
			[2623, 2819],
		],
		title: { x: 2662, y: 2632, align: 'start' },
	},
	{
		key: 'aggregated_power',
		tone: 'gray',
		points: [
			[2341, 2818],
			[2341, 2457],
		],
		title: { x: 2321, y: 2632, align: 'end' },
	},
	{
		key: 'device_dispatch',
		tone: 'green',
		points: [
			[2623, 3182],
			[2623, 3543],
		],
	},
	{
		key: 'device_power',
		tone: 'gray',
		points: [
			[2341, 3542],
			[2341, 3181],
		],
	},
	{
		key: 'metering',
		tone: 'gray',
		points: [
			[3927, 2063],
			[3927, 671],
			[2869, 671],
		],
		title: { x: 3372, y: 636, align: 'center' },
		text: { x: 3372, y: 680, align: 'center' },
	},
	{
		key: 'rewards_aggregator',
		tone: 'green',
		points: [
			[2870, 727],
			[3873, 727],
			[3873, 2064],
		],
		title: { x: 3372, y: 756, align: 'center' },
	},
	{
		key: 'supply_contract',
		tone: 'gray',
		points: [
			[2870, 3693],
			[3873, 3693],
			[3873, 2394],
		],
		title: { x: 3372, y: 3658, align: 'center' },
	},
	{
		key: 'rewards_site',
		tone: 'green',
		points: [
			[3927, 2395],
			[3927, 3755],
			[2869, 3755],
		],
		title: { x: 3372, y: 3778, align: 'center' },
	},
	{
		key: 'weather',
		tone: 'muted',
		points: [
			[962, 2023],
			[962, 2064],
		],
		pulses: false,
	},
	{
		key: 'prices',
		tone: 'muted',
		points: [
			[1239, 2023],
			[1239, 2064],
		],
		pulses: false,
	},
];
