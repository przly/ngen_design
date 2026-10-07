import { memo } from 'react';
import Img from '@/components/atoms/Img/Img';
import Tag from '@/components/atoms/Tag/Tag';
import type { IconProps } from '@/components/atoms/Icon/Icon';
import type { Lcf } from '@/core/interfaces/lcf.interface';
import cn from '@/utils/cn';
import { connectGroup, groupTags, siteGroup, type GroupTagKey } from './diagram';

export interface DiagramGroupsProps {
	logo?: Lcf.Image;
	site_tag?: Lcf.Text;
	weather_tag?: Lcf.Text;
	prices_tag?: Lcf.Text;
}

const tagIcons: Record<GroupTagKey, IconProps['icon']> = {
	site: 'HomeWork',
	weather: 'PartlyCloudyDay',
	prices: 'Euro',
};

// Fixed Figma coordinates share the same camera as the nodes and connectors.
function DiagramGroups({ logo, site_tag, weather_tag, prices_tag }: DiagramGroupsProps) {
	const tags: Record<GroupTagKey, Lcf.Text | undefined> = { site: site_tag, weather: weather_tag, prices: prices_tag };

	return (
		<div className="pointer-events-none absolute inset-0">
			<div
				className="absolute rounded-3xl border border-green-200 bg-green-50"
				style={{ left: connectGroup.x, top: connectGroup.y, width: connectGroup.width, height: connectGroup.height }}
			>
				{logo?.src && (
					<Img
						{...logo}
						height={32}
						width={173}
						loading="eager"
						wrapperClassName="absolute top-6 left-6 h-8 w-auto"
						imgClassName="h-full w-auto object-contain"
					/>
				)}
			</div>

			<svg
				className="absolute overflow-visible text-gray-500"
				style={{ left: siteGroup.x, top: siteGroup.y }}
				width={siteGroup.width}
				height={siteGroup.height}
				fill="none"
				aria-hidden="true"
			>
				<rect
					x={0.5}
					y={0.5}
					width={siteGroup.width - 1}
					height={siteGroup.height - 1}
					rx={23.5}
					stroke="currentColor"
					strokeDasharray="10 10"
				/>
			</svg>

			{(Object.keys(groupTags) as GroupTagKey[]).map((key) => (
				<div
					key={key}
					className={cn('absolute flex', groupTags[key].centered && '-translate-x-1/2')}
					style={{ left: groupTags[key].x, top: groupTags[key].y }}
				>
					<Tag title={tags[key]} icon={tagIcons[key]} icon_size="small" modifier="dark" className="whitespace-nowrap" />
				</div>
			))}
		</div>
	);
}

export default memo(DiagramGroups);
