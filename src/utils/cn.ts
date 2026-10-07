import { cnMerge } from 'tailwind-variants';

function cn(...inputs: Parameters<typeof cnMerge>) {
	return cnMerge(...inputs)({ twMerge: true });
}

export default cn;
