import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import Icon, { type IconProps } from '@/components/atoms/Icon/Icon';
import Spinner, { type SpinnerProps } from '@/components/atoms/Spinner/Spinner';
import cn from '@/utils/cn';

export interface ButtonProps {
	modifier?: VariantProps<typeof buttonStyles>['modifier'];
	size?: VariantProps<typeof buttonStyles>['size'];
	leftIcon?: IconProps['icon'];
	leftIconProps?: Partial<IconProps & { className?: string }>;
	rightIcon?: IconProps['icon'];
	rightIconProps?: Partial<IconProps & { className?: string }>;
	isLoading?: boolean;
	isDisabled?: boolean;
	asChild?: boolean;
	iconOnly?: boolean;
}

type ButtonParams = ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

const buttonStyles = tv({
	base: 'group focus-visible:outline-focus relative inline-flex cursor-pointer justify-center rounded-4xl p-px py-2 transition-all duration-80 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-98',
	variants: {
		modifier: {
			primary: 'border-green-gradient green-gradient-hover text-gray-900',
			secondary: 'border-gray-gradient gray-gradient-hover text-white',
			white: 'border-white-gradient white-gradient-hover text-gray-900',
			gray: 'border border-gray-50 bg-gray-50 text-gray-900 hover:border-gray-100 hover:bg-gray-100',
			transparent: 'border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20',
		},
		size: {
			default: 'min-h-11 gap-2 px-4 text-sm',
			small: 'min-h-9.5 min-w-9.5 gap-1.5 px-3.5 text-xs',
			medium: 'min-h-10 gap-2 px-3 text-sm',
			xs: 'min-h-7.5 gap-1.5 px-3.5 text-xs',
		},
		disabled: {
			true: 'pointer-events-none border-gray-200! bg-gray-200! bg-none! text-gray-400!',
		},
	},
	defaultVariants: {
		modifier: 'primary',
		size: 'default',
		disabled: false,
	},
	slots: {
		content: 'relative flex items-center justify-center gap-2 font-medium',
	},
});

const ButtonIcon = ({
	icon,
	className,
	size,
	...props
}: { icon: ButtonProps['leftIcon']; size: ButtonProps['size']; modifier?: ButtonProps['modifier'] } & ButtonProps['leftIconProps']) => {
	if (!icon) {
		return null;
	}

	return <Icon {...props} className={cn('text-current', size === 'small' ? 'size-3' : 'size-3.5', className)} icon={icon} />;
};

function Button({
	modifier,
	size,
	leftIcon,
	leftIconProps,
	rightIcon,
	rightIconProps,
	className,
	isLoading,
	isDisabled,
	disabled,
	asChild = false,
	iconOnly = false,
	children,
	type = 'button',
	...props
}: ButtonParams) {
	const disabledState = Boolean(disabled || isDisabled || isLoading);
	const Comp = asChild ? Slot : 'button';
	const { base, content } = buttonStyles({
		modifier,
		size,
		disabled: disabledState,
	});

	const slottedChildProps =
		asChild && React.isValidElement(children) ? (children.props as { children?: React.ReactNode; title?: React.ReactNode }) : undefined;
	const childNode = slottedChildProps ? (slottedChildProps.children ?? slottedChildProps.title) : children || props.title;
	const isIconOnly = iconOnly || (Boolean(leftIcon || rightIcon) && !childNode);
	const accessibleLabel =
		props['aria-label'] ??
		(typeof props.title === 'string' ? props.title : undefined) ??
		(typeof slottedChildProps?.title === 'string' ? slottedChildProps.title : undefined) ??
		(typeof childNode === 'string' ? childNode : undefined);

	const inner = (
		<>
			<div className={content({ className: cn(isLoading && 'invisible', isIconOnly && 'w-full') })}>
				<ButtonIcon {...leftIconProps} icon={leftIcon} modifier={modifier} size={size} />
				{childNode && !isIconOnly ? <span>{childNode}</span> : null}
				<ButtonIcon {...rightIconProps} icon={rightIcon} modifier={modifier} size={size} />
			</div>
			<Spinner
				className={cn(['grid-stack-item absolute inset-0', !isLoading && 'invisible'])}
				modifier={modifier as unknown as SpinnerProps['modifier']}
			/>
		</>
	);

	return (
		<Comp
			aria-disabled={disabledState}
			className={base({
				className: cn(className, isIconOnly && (size === 'xs' ? 'size-7.5 p-0' : size === 'small' ? 'size-8 p-0' : 'size-11 p-0')),
			})}
			disabled={asChild ? undefined : disabledState}
			type={asChild ? undefined : type}
			{...props}
			{...(isIconOnly && accessibleLabel ? { 'aria-label': accessibleLabel } : {})}
		>
			{asChild && React.isValidElement(children)
				? // eslint-disable-next-line react/no-clone-element
					React.cloneElement(children as React.ReactElement, undefined, inner)
				: inner}
		</Comp>
	);
}

export default Button;
