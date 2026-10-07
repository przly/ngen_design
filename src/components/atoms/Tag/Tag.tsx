import type { Lcf } from '@/core/interfaces/lcf.interface';
import cn from '@/utils/cn';
import Text from '@/components/atoms/Text/Text';
import type { IconProps } from '@/components/atoms/Icon/Icon';
import Icon from '@/components/atoms/Icon/Icon';

export interface TagProps {
	title?: Lcf.Text;
	modifier?: 'green' | 'gray' | 'dark' | 'white';
}

type TagParams = TagProps & {
	icon?: IconProps['icon'];
	icon_size?: 'default' | 'small';
	className?: string;
	textClassName?: string;
};

function Tag({ title, className, icon, icon_size = 'default', modifier = 'dark', textClassName }: TagParams) {
	if (!title) {
		return null;
	}
	return (
		<div
			className={cn(
				'font-secondary inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 py-1',
				modifier === 'green' && 'border-green-gradient text-gray-900',
				modifier === 'gray' && 'border border-transparent bg-gray-100 text-gray-900',
				modifier === 'dark' && 'border-gray-gradient text-white',
				modifier === 'white' && 'border-white-gradient white-gradient-hover text-gray-900',
				className,
			)}
		>
			{icon && (
				<Icon className={cn('flex items-center justify-center [&_svg]:h-full', icon_size === 'small' ? 'size-3' : 'size-4')} icon={icon} />
			)}
			<Text className={cn('text-xs font-semibold tracking-tight uppercase', textClassName)}>{title}</Text>
		</div>
	);
}

export default Tag;
