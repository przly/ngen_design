import Title from '@/components/atoms/Title/Title';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import cn from '@/utils/cn';

export interface SuperTitleProps {
	tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
	title?: Lcf.Text;
	className?: string;
	variant?: 'light' | 'dark';
}

type SuperTitleParams = SuperTitleProps;

function SuperTitle({ tag = 'h2', title, className, variant = 'light' }: SuperTitleParams) {
	if (!title) {
		return null;
	}

	return (
		<div className={cn('flex items-center gap-4 lg:gap-6', className)}>
			<div className="size-2.5 shrink-0 rounded-full bg-green-600" />
			{tag === 'span' ? (
				<span className={cn('super-title', variant === 'dark' && 'text-white!', 'in-[.theme-dark]:text-white!')}> {title} </span>
			) : (
				<Title
					modifier="h2"
					tag={tag}
					className={cn('super-title', variant === 'dark' && 'text-white!', 'in-[.theme-dark]:text-white!')}
					title={title}
				/>
			)}
		</div>
	);
}

export default SuperTitle;
