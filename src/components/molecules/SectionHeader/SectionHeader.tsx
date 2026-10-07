import type { Lcf } from '@/core/interfaces/lcf.interface';
import Anchor from '@/components/atoms/Anchor/Anchor';
import Text from '@/components/atoms/Text/Text';
import Title from '@/components/atoms/Title/Title';
import Button, { type ButtonProps } from '@/components/atoms/Button/Button';
import SuperTitle from '@/components/atoms/SuperTitle/SuperTitle';
import { tv, type VariantProps } from 'tailwind-variants';
import cn from '@/utils/cn';
import Icon, { type IconProps } from '@/components/atoms/Icon/Icon';

const sectionHeaderStyles = tv({
	slots: {
		layout: '',
		superTitle: '',
		title: '',
		spacer: 'hidden',
		body: '',
		text: '',
		button: 'mt-6 2xl:mt-10',
		title_className: '',
	},
	variants: {
		variant: {
			default: {
				layout: 'grid items-start lg:grid-cols-12 lg:gap-2.5',
				superTitle: 'lg:col-span-12',
				title: 'lg:col-span-6',
				spacer: 'hidden lg:col-span-1 lg:block xl:col-span-2',
				body: 'lg:col-span-5 xl:col-span-4 2xl:col-span-3',
				text: 'mt-4 max-w-89.5 text-lg leading-tight font-medium tracking-[-0.02em] text-gray-900 lg:text-xl',
			},
			centered: {
				layout: 'mx-auto flex max-w-120 flex-col items-center justify-center gap-6 text-center md:gap-8',
				text: 'text-gray-500',
			},
			banner: {
				layout: 'flex h-full flex-col',
				title: 'mt-auto pt-5 lg:pt-4',
				spacer: 'block h-1.5 md:h-4',
				button: 'mt-8',
				text: 'max-w-120 font-medium text-gray-500',
				title_className: 'leading-none!',
			},
			banner_info: {
				layout: 'flex h-full flex-col',
				title: 'mt-auto',
				spacer: 'block h-3',
				text: 'text-gray-500',
				button: 'mt-6 2xl:mt-8',
				title_className: 'text-gray-900!',
			},
			stacked: {
				layout: 'flex flex-col gap-6 lg:gap-8 xl:gap-12',
				title: 'mt-0',
				spacer: 'hidden',
				button: 'mt-0!',
				text: 'font-medium text-gray-500',
				title_className: 'mt-0 leading-none!',
				body: 'flex flex-col items-start gap-6 lg:gap-8 xl:gap-12',
			},
			stacked_small: {
				layout: 'flex max-w-120.5 flex-col gap-6',
				title: 'mt-0',
				spacer: 'hidden',
				button: 'mt-0!',
				text: 'text-gray-500',
				title_className: 'mt-0 leading-none!',
				body: 'flex flex-col items-start gap-6',
			},
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type SectionHeaderVariant = VariantProps<typeof sectionHeaderStyles>['variant'];

export interface SectionHeaderProps {
	super_title?: Lcf.Text;
	title?: Lcf.Textarea;
	text?: Lcf.Textarea;
	button?: Lcf.Link;
	secondary_button?: Lcf.Link;
	button_class?: Lcf.Text;
	dark?: Lcf.Boolean;
	with_padding?: Lcf.Boolean;
	wide_text?: Lcf.Boolean;
	listing?: Lcf.Repeater<{ text?: Lcf.Text }>;
}

type SectionHeaderParams = SectionHeaderProps & {
	super_title_tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
	title_tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	title_modifier?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	size?: 'small' | 'default';
	button_modifier?: Lcf.Select<NonNullable<ButtonProps['modifier']>>;
	secondary_button_modifier?: Lcf.Select<NonNullable<ButtonProps['modifier']>>;
	variant?: VariantProps<typeof sectionHeaderStyles>['variant'];
	title_className?: string;
	text_className?: string;
	body_className?: string;
	layout_className?: string;
	button_left_icon?: IconProps['icon'];
	button_right_icon?: IconProps['icon'];
};

function SectionHeader({
	super_title,
	super_title_tag = 'h2',
	title,
	text,
	button,
	button_modifier = 'primary',
	button_class,
	secondary_button_modifier = 'primary',
	variant = 'default',
	dark = false,
	title_tag = 'h3',
	title_modifier = 'h3',
	size = 'default',
	with_padding = false,
	listing,
	secondary_button,
	title_className,
	text_className,
	wide_text = false,
	body_className,
	layout_className,
	button_left_icon,
	button_right_icon = 'ArrowRight',
}: SectionHeaderParams) {
	const styles = sectionHeaderStyles({ variant });
	const isSmall = size === 'small';
	const isStacked = variant === 'stacked' || variant === 'stacked_small';
	const isStackedSmall = variant === 'stacked_small';
	const listingItems = listing?.filter((item) => item.text) ?? [];

	return (
		<div className={cn(styles.layout(), wide_text && 'max-w-none', layout_className)}>
			{super_title && (
				<SuperTitle tag={super_title_tag} title={super_title} variant={dark ? 'dark' : 'light'} className={styles.superTitle()} />
			)}

			<div className={styles.title()}>
				<Title
					modifier={title_modifier}
					tag={title_tag}
					titleClassName={cn(
						variant === 'centered' || isStacked ? 'mt-0!' : 'mt-3',
						styles.title_className(),
						dark && '[&_strong]:text-white!',
						(isSmall || isStackedSmall) && 'text-2xl! 2xl:text-3xl!',
						isSmall && dark && 'text-white!',
						title_className,
					)}
					title={title}
				/>
			</div>

			{!with_padding && variant !== 'centered' && <div className={styles.spacer()} />}

			{(text || listingItems.length > 0 || button || secondary_button) && (
				<div className={cn(styles.body(), body_className)}>
					<Text className={cn(styles.text(), isSmall && 'text-sm', text_className)}>{text}</Text>

					{listingItems.length > 0 && (
						<ul className="grid list-none grid-cols-1 gap-4 font-medium text-gray-500 sm:grid-cols-2">
							{listingItems.map((item, index) => (
								<li key={index} className="flex items-center gap-4">
									<Icon icon="Checkmark" className="size-4 shrink-0 text-green-500" aria-hidden="true" />
									<Text>{item.text}</Text>
								</li>
							))}
						</ul>
					)}

					{(button || secondary_button) && (
						<div className="flex items-center gap-4">
							{button && (
								<Button
									asChild
									modifier={button_modifier}
									rightIcon={button_right_icon}
									leftIcon={button_left_icon}
									className={styles.button({ className: button_class })}
								>
									<Anchor {...button} />
								</Button>
							)}

							{secondary_button && (
								<Button
									asChild
									modifier={secondary_button_modifier}
									rightIcon="ArrowRight"
									className={styles.button({ className: button_class })}
								>
									<Anchor {...secondary_button} />
								</Button>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default SectionHeader;
