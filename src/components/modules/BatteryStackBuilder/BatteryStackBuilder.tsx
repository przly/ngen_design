import { animate, AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { Fragment, useEffect, useRef, useState, type PointerEvent } from 'react';
import Button from '@/components/atoms/Button/Button';
import Icon from '@/components/atoms/Icon/Icon';
import Img from '@/components/atoms/Img/Img';
import Text from '@/components/atoms/Text/Text';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import cn from '@/utils/cn';

// Partial clone of the website repo's src/components/modules/BatteryStackBuilder: the count slider,
// the selectable item cards and the dark total card of its sideways variant, with their markup
// unchanged apart from the additions marked "not in the website's module". The 3D scene, the
// section header and the vertical (master + slaves) variant are left out.
export interface BatteryStackBuilderProps {
	slider_label?: Lcf.Text;
	slider_mobile_label?: Lcf.Text;
	min?: Lcf.Number;
	max?: Lcf.Number;
	/** One selectable item per model. */
	items?: Lcf.Repeater<{
		title?: Lcf.Text;
		text?: Lcf.Text;
		image?: Lcf.Image;
		capacity_kwh?: Lcf.Number;
	}>;
	/** Supports the {count} placeholder. */
	total_title?: Lcf.Text;
	total_text?: Lcf.Text;
	total_image?: Lcf.Image;
}

type BatteryStackBuilderParams = BatteryStackBuilderProps;
type BatteryStackItem = NonNullable<BatteryStackBuilderProps['items']>[number];

const EMPTY_ITEMS: BatteryStackItem[] = [];

// Shared by the two number animations. The slider thumb uses the same values as Tailwind classes
// (duration-250 ease-[cubic-bezier(0.33,1,0.68,1)]); keep the three in step.
const DURATION = 0.25;
// Robert Penner's easeOutCubic.
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;

function CountSlider({
	label,
	mobileLabel,
	min,
	max,
	value,
	onChange,
}: {
	label?: string;
	mobileLabel?: string;
	min: number;
	max: number;
	value: number;
	onChange: (value: number) => void;
}) {
	const steps = Array.from({ length: max - min + 1 }, (_, index) => min + index);
	const span = Math.max(max - min, 1);
	const canDecrement = value > min;
	const canIncrement = value < max;
	const resolvedMobileLabel = mobileLabel ?? label;
	// Not in the website's module: the stop the cursor is over, which is where a click would send the thumb.
	const [hoveredStep, setHoveredStep] = useState<number | null>(null);
	const hoverPoint = hoveredStep === value ? null : hoveredStep;

	const handleTrackPointerMove = (event: PointerEvent<HTMLInputElement>) => {
		// Touch and pen have no hover; their pointermove only fires mid-drag.
		if (event.pointerType !== 'mouse') return;

		const { left, width } = event.currentTarget.getBoundingClientRect();
		// The stops sit on a line inset 1.5rem from each end of the track.
		const inset = 1.5 * parseFloat(getComputedStyle(event.currentTarget.ownerDocument.documentElement).fontSize);
		const ratio = (event.clientX - left - inset) / Math.max(width - inset * 2, 1);

		setHoveredStep(Math.min(max, Math.max(min, Math.round(min + ratio * span))));
	};

	return (
		<div className="mx-auto grid w-full max-w-116 gap-3">
			{resolvedMobileLabel && <Text className="text-center text-xs text-gray-500 lg:hidden">{resolvedMobileLabel}</Text>}
			{label && <Text className="hidden text-center text-sm text-gray-500 lg:block">{label}</Text>}

			<div className="flex items-center justify-center gap-6 lg:hidden">
				<Button disabled={!canDecrement} onClick={() => onChange(value - 1)} modifier="secondary" leftIcon="Minus" />
				<span aria-live="polite" className="min-w-6 text-center text-xl font-medium tracking-tight text-gray-900">
					{value}
				</span>
				<Button disabled={!canIncrement} onClick={() => onChange(value + 1)} modifier="secondary" leftIcon="Plus" />
			</div>

			<div className="hidden gap-3 lg:grid">
				<div className="relative h-8.75 rounded-full border-[0.5px] border-gray-100 bg-gray-50">
					{/* Every stop keeps its dot (the website hides the current one): the thumb covers it, and a dot popping in or out mid-glide would show. */}
					{/* Hover point: a ghost of the grab handle behind the stop a click would go to. */}
					{steps.map((step) => (
						<span
							key={step}
							aria-hidden="true"
							className={`pointer-events-none absolute top-0.75 h-7 w-10 -translate-x-1/2 rounded-full bg-gray-100 ${
								step === hoverPoint ? 'opacity-100' : 'opacity-0'
							}`}
							style={{ left: `calc(1.5rem + (100% - 3rem) * ${(step - min) / span})` }}
						/>
					))}
					{steps.map((step) => (
						<span
							key={step}
							aria-hidden="true"
							className={`pointer-events-none absolute top-1/2 size-1 -translate-1/2 rounded-full ${
								step === hoverPoint ? 'bg-gray-500' : 'bg-gray-300'
							}`}
							style={{ left: `calc(1.5rem + (100% - 3rem) * ${(step - min) / span})` }}
						/>
					))}
					<div
						aria-hidden="true"
						className="btn-shadow pointer-events-none absolute top-0.75 flex h-7 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-gray-800 bg-gray-900 transition-[left] duration-250 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none"
						style={{ left: `calc(1.5rem + (100% - 3rem) * ${(value - min) / span})` }}
					>
						<Icon icon="DragIndicator" className="mt-0.5 size-3 text-gray-500 [&_svg]:h-full" />
					</div>
					<input
						type="range"
						min={min}
						max={max}
						step={1}
						value={value}
						aria-label={label}
						onChange={(event) => onChange(Number(event.target.value))}
						onPointerMove={handleTrackPointerMove}
						onPointerLeave={() => setHoveredStep(null)}
						// The 3rem native thumb makes the browser's own stops land on the dots (1.5rem in from each end),
						// so a click goes to the stop the hover point shows. The website keeps the default thumb width.
						// -bottom-3.5 stretches the input over the track's border and the gap above the numbers, so the hover point holds on the way down to them.
						className="absolute inset-x-0 top-0 -bottom-3.5 z-1 w-full cursor-pointer appearance-none opacity-0 [&::-moz-range-thumb]:w-12 [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:w-12 [&::-webkit-slider-thumb]:appearance-none"
					/>
				</div>
				<div className="relative h-5">
					{steps.map((step) => (
						<button
							type="button"
							key={step}
							aria-pressed={step === value}
							onClick={() => onChange(step)}
							onPointerEnter={(event) => event.pointerType === 'mouse' && setHoveredStep(step)}
							onPointerLeave={() => setHoveredStep(null)}
							className={`absolute w-8 -translate-x-1/2 cursor-pointer text-center text-xs font-medium ${
								step === hoverPoint ? 'text-gray-900' : 'text-gray-500'
							}`}
							style={{ left: `calc(1.5rem + (100% - 3rem) * ${(step - min) / span})` }}
						>
							{step}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

// Not in the website's module, which swaps the number instantly: counts from the previous total to the new one.
function AnimatedNumber({ value }: { value: number }) {
	const reducedMotion = useReducedMotion() ?? false;
	const [display, setDisplay] = useState(value);
	const latestDisplay = useRef(value);
	// Hold the target's decimal places for the whole count, so the number doesn't change width as trailing zeros come and go.
	const fractionDigits = Math.min(2, String(value).split('.').at(1)?.length ?? 0);
	const formatted = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(display);
	const formattedValue = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);

	useEffect(() => {
		const controls = animate(latestDisplay.current, value, {
			// Same timing as the slider thumb's glide, so both land together.
			duration: reducedMotion ? 0 : DURATION,
			ease: EASE_OUT_CUBIC,
			onUpdate: (latest) => {
				latestDisplay.current = latest;
				setDisplay(latest);
			},
		});

		return () => controls.stop();
	}, [value, reducedMotion]);

	return (
		<>
			{/* Screen readers get the final value once, not every frame of the count. */}
			<span className="sr-only">{formattedValue}</span>
			<span aria-hidden="true" className="tabular-nums">
				{formatted}
			</span>
		</>
	);
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Not in the website's module. Modelled on Motion+'s AnimateNumber (motion.dev/docs/react-animate-number)
// with plain motion, since that component needs a paid Motion+ token: every digit is a 0–9 wheel that rolls
// to its new value, and a digit that appears or disappears opens or closes its own width so the text after
// it slides along.
function RollingNumber({ value }: { value: number }) {
	const reducedMotion = useReducedMotion() ?? false;
	const digits = Array.from(String(Math.trunc(Math.abs(value))));
	// Same timing as the slider thumb's glide.
	const transition: Transition = { duration: reducedMotion ? 0 : DURATION, ease: EASE_OUT_CUBIC };

	return (
		<span className="inline-block whitespace-nowrap tabular-nums">
			<AnimatePresence initial={false}>
				{digits.map((digit, index) => (
					<motion.span
						// Keyed by place value, so the ones digit stays the ones digit when the number gains a digit.
						key={digits.length - index}
						// clip-path, not overflow-hidden: overflow would move the inline-block's baseline off the text baseline.
						className="relative inline-block [clip-path:inset(0)]"
						initial={{ width: 0, opacity: 0 }}
						animate={{ width: 'auto', opacity: 1 }}
						exit={{ width: 0, opacity: 0 }}
						transition={transition}
					>
						{/* Invisible copy that gives the slot its width, height and baseline. */}
						<span className="invisible">{digit}</span>
						<motion.span
							className="absolute top-0 left-0"
							initial={false}
							animate={{ y: `${-Number(digit) * 10}%` }}
							transition={transition}
						>
							{DIGITS.map((wheelDigit) => (
								<span key={wheelDigit} className="block">
									{wheelDigit}
								</span>
							))}
						</motion.span>
					</motion.span>
				))}
			</AnimatePresence>
		</span>
	);
}

function BatteryStackBuilder({
	slider_label,
	slider_mobile_label,
	min = 1,
	max = 4,
	items = EMPTY_ITEMS,
	total_title,
	total_text,
	total_image,
}: BatteryStackBuilderParams) {
	const [count, setCount] = useState<number>(min);
	const [selectedIndex, setSelectedIndex] = useState(0);
	// Rounded so float noise (5.18 * 3) can't add decimals. The website formats with the page's locale
	// (usePage().props.page.data.locale); there is no Inertia page here.
	const totalCapacity = Math.round((items.at(selectedIndex)?.capacity_kwh ?? 0) * count * 100) / 100;
	const formattedTotalTitle = total_title?.replaceAll('{count}', String(count));
	const totalTitleParts = total_title?.split('{count}') ?? [];

	return (
		<div className="container">
			<div className="mx-auto grid max-w-140 gap-9 lg:gap-12">
				<div className="grid gap-2 lg:gap-3">
					{items.map((item, index) => {
						const isSelected = index === selectedIndex;

						return (
							<button
								type="button"
								key={index}
								aria-pressed={isSelected}
								onClick={() => setSelectedIndex(index)}
								className={cn(
									'group relative flex cursor-pointer flex-col gap-2.5 rounded-[20px] border-[0.5px] border-gray-100 bg-gray-50 p-6 text-left hover:bg-gray-100 lg:flex-row lg:rounded-3xl lg:p-12',
									isSelected && 'bg-gray-100',
								)}
							>
								<div className="flex shrink-0 flex-col items-start justify-between gap-6">
									{/* Not in the website's module: hovering an unselected card gives it the selected background and tints its check box. */}
									<span
										aria-hidden="true"
										className={cn(
											'flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white',
											!isSelected && 'group-hover:bg-gray-50',
										)}
									>
										<Icon icon="Checkmark" className={cn('size-5 text-gray-900 opacity-0', isSelected && 'opacity-100')} />
									</span>
									<div className="grid gap-1 pt-35 lg:pt-0">
										<Text as="div" className="text-xl font-medium tracking-[-0.02em] text-gray-900">
											{item.title}
										</Text>
										<Text as="div" className="text-xs text-gray-500">
											{item.text}
										</Text>
									</div>
								</div>
								{item.image && (
									<Img
										{...item.image}
										width={240}
										height={180}
										wrapperClassName="flex-auto flex items-center h-40 lg:h-36.25 justify-center absolute lg:relative top-15 lg:top-0 left-0"
										imgClassName="h-full w-auto object-contain"
									/>
								)}
							</button>
						);
					})}

					<div
						className="relative isolate -order-1 flex min-h-48.5 flex-col overflow-hidden rounded-[20px] border-[0.5px] border-gray-800 bg-gray-900 p-6 text-white lg:order-0 lg:min-h-67 lg:rounded-3xl lg:p-12"
						aria-live="polite"
					>
						{total_image && (
							<Img
								{...total_image}
								width={760}
								height={340}
								wrapperClassName="absolute inset-0 -z-1 opacity-70 before:pointer-events-none before:absolute before:inset-0 before:z-2 before:bg-[linear-gradient(90deg,var(--color-gray-900)_0%,rgba(4,28,44,0)_100%)]"
								imgClassName="h-full w-full object-cover"
							/>
						)}
						{/* A plain div where the website has a Text atom: Text only takes an HTML string, and the count is a component here. */}
						{formattedTotalTitle && (
							<div className="text-base font-medium tracking-tight text-white lg:text-xl">
								{/* Screen readers get the title as one string instead of a column of digits. */}
								<span className="sr-only">{formattedTotalTitle}</span>
								<span aria-hidden="true">
									{totalTitleParts.map((part, index) => (
										<Fragment key={index}>
											{index > 0 && <RollingNumber value={count} />}
											{part}
										</Fragment>
									))}
								</span>
							</div>
						)}
						<div className="mt-auto grid gap-4">
							<div className="text-5xl font-medium tracking-[-0.04em] text-white lg:text-7xl">
								<AnimatedNumber value={totalCapacity} /> <span className="text-3xl">kWh</span>
							</div>
							<Text as="div" className="text-xs font-medium text-gray-500">
								{total_text}
							</Text>
						</div>
					</div>
				</div>

				<CountSlider
					label={slider_label}
					mobileLabel={slider_mobile_label}
					min={min}
					max={max}
					value={count}
					onChange={setCount}
				/>
			</div>
		</div>
	);
}

export default BatteryStackBuilder;
