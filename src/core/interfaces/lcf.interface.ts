// *********************************************************************************
// DOCUMENTATION:
// https://specto-it.atlassian.net/wiki/spaces/DEV/pages/627638273/List+of+LCF+types
// *********************************************************************************

import type { InertiaLinkProps } from '@inertiajs/react';

/**
 * Internal constraint for explicitly named schema fields; rejects open index signatures.
 * Unlike Record<string, unknown>, it accepts interfaces without adding a catch-all key.
 * @example LcfFieldShape<{ title?: Lcf.Text }> // Keeps the declared title field.
 */
type LcfFieldShape<T> = {
	[Key in keyof T]: string extends Key ? never : number extends Key ? never : symbol extends Key ? never : T[Key];
};

/**
 * Internal guard against any, arrays and callable values masquerading as field objects.
 * @example LcfObjectValue<{ title: Lcf.Text }> // { title: Lcf.Text }
 */
type LcfObjectValue<T> = 0 extends 1 & T ? never : T extends readonly unknown[] | ((...args: never[]) => unknown) ? never : T;

/**
 * CMS/runtime content contracts consumed by the LCF generator and frontend.
 * Use Lcf types for content fields in ComponentProps; put frontend-only options in
 * ComponentParams. Reusable child components use ChildProps with Lcf-typed content.
 * These are JSON shapes, not runtime validators. Primitive aliases remain compatible
 * with ordinary JSON; TypeScript cannot enforce spelling `Lcf.Text` instead of `string`.
 */
export namespace Lcf {
	/**
	 * Short plain text without HTML tags. CMS field: LcfText.
	 * @example title?: Lcf.Text;
	 */
	export type Text = string;

	/**
	 * Multiline text that may contain <br> line breaks. CMS field: LcfTextarea.
	 * @example introduction?: Lcf.Textarea;
	 */
	export type Textarea = string;

	/**
	 * Rich text containing HTML markup. CMS field: LcfWysiwyg.
	 * @example body?: Lcf.Wysiwyg;
	 */
	export type Wysiwyg = string;

	/**
	 * Serialized calendar date, not a JavaScript Date. CMS field: LcfDatePicker.
	 * Display examples include "22.12.2021"; use the actual backend format when parsing.
	 * @example published_on?: Lcf.Date;
	 */
	export type Date = string;

	/**
	 * Serialized date and time. CMS field: LcfDateTimePicker.
	 * Display examples include "22.12.2021 15:00"; format/timezone are backend concerns.
	 * @example starts_at?: Lcf.DateTime;
	 */
	export type DateTime = string;

	/**
	 * Serialized time of day. CMS field: LcfTimePicker.
	 * @example opening_time?: Lcf.Time;
	 */
	export type Time = string;

	/**
	 * Color value, normally a hexadecimal color string. CMS field: LcfColorPicker.
	 * @example background_color?: Lcf.Color; // e.g. "#00aa66"
	 */
	export type Color = string;

	/**
	 * Email address string; address validation belongs to the CMS/form.
	 * CMS field: LcfEmail.
	 * @example contact_email?: Lcf.Email;
	 */
	export type Email = string;

	/**
	 * Numeric CMS value. CMS field: LcfNumber (documented for integer inputs).
	 * TypeScript's number cannot enforce integer-only values; configure validation in CMS.
	 * @example employee_count?: Lcf.Number;
	 */
	export type Number = number;

	/**
	 * Transformed image metadata, not a raw media ID or URL. CMS field: LcfImage.
	 * Pass the complete value to Img: <Img {...image} />. An optional mobile variant
	 * carries its own source metadata; fields may be absent for an empty image.
	 * @example image?: Lcf.Image;
	 */
	export interface Image {
		id?: number;
		src?: string;
		alt?: string;
		srcSet?: string;
		tiny?: string;
		caption?: string;
		loading?: 'eager' | 'lazy';
		mobile?: {
			id?: number;
			src?: string;
			alt?: string;
			srcSet?: string;
			tiny?: string;
		};
	}

	/**
	 * Transformed video source and playback settings. CMS field: LcfVideo.
	 * Both type and url are required; this is not the complete react-player prop API.
	 * @example video?: Lcf.Video; // { type: 'youtube', url: 'https://youtu.be/...' }
	 */
	export interface Video {
		type: 'youtube' | 'vimeo' | 'link' | 'file';
		url: string;
		poster?: string;
		autoPlay?: boolean;
		playsInline?: boolean;
		loop?: boolean;
		controls?: boolean;
		muted?: boolean;
	}

	/**
	 * Transformed downloadable file, including its nested file wrapper. CMS field: LcfFile.
	 * Read document.file.src rather than document.src; this is not the browser File type.
	 * @example document?: Lcf.File; // { file: { src: '/files/brochure.pdf', title: 'Brochure' } }
	 */
	export interface File {
		file: {
			src: string;
			title?: string;
			desc?: string;
		};
	}

	/**
	 * True/false content value, not a string or numeric flag. CMS field: LcfBoolean.
	 * Frontend-only state belongs in Params even if its runtime value is boolean.
	 * @example show_summary?: Lcf.Boolean;
	 */
	export type Boolean = boolean;

	/**
	 * Named group of CMS fields that is not a reusable component. CMS field: LcfObject.
	 * Write the fields inline so the generator can discover them. For a child component,
	 * use ChildProps directly; Lcf.Object<ChildProps> does not generate its child schema.
	 * @example person?: Lcf.Object<{ image: Lcf.Image; phone_number: Lcf.Text }>;
	 */
	export type Object<T extends object & LcfFieldShape<T>> = LcfObjectValue<T>;

	/**
	 * Array of transformed images. CMS field: LcfGallery.
	 * Use this for an image gallery; use Repeater when each row has additional fields.
	 * @example images?: Lcf.Gallery;
	 */
	export type Gallery = Image[];

	/**
	 * One selected primitive from an explicit finite set. CMS field: LcfSelect.
	 * Prefer inline literal options; supported icon selects can use IconProps['icon']
	 * or keyof typeof icons. Other aliases need verified generator support.
	 * Never widen the options to string/number or use a cast to accept an invalid value.
	 * @example modifier?: Lcf.Select<'green' | 'gray' | 'dark' | 'white'>;
	 */
	export type Select<T extends string | number | boolean | undefined> = T;

	/**
	 * Array of explicitly shaped row objects. CMS field: LcfRepeater.
	 * Declare an inline object with named fields. Wrap a reusable component under a
	 * field such as item; do not pass ChildProps directly or intersect it with Record.
	 * The wrapper is real JSON: render rows with <Child {...row.item} /> and keep
	 * stories, query output and CMS data consistent with that shape.
	 * TypeScript checks structure, not inline syntax or whether a type is a component;
	 * those rules still require source review. Never bypass checks with any or casts.
	 * @example items?: Lcf.Repeater<{ title: Lcf.Text; description?: Lcf.Textarea }>;
	 * @example items?: Lcf.Repeater<{ item: BenefitsCardProps }>;
	 */
	export type Repeater<T extends object & LcfFieldShape<T>> = LcfObjectValue<T> extends never ? never : LcfObjectValue<T>[];

	/**
	 * Transformed internal/external link metadata. CMS field: LcfLink.
	 * Pass the whole value to Anchor: <Anchor {...link} />, preserving target and rel.
	 * This is not a raw URL or the full set of frontend Anchor/Inertia props.
	 * @example cta?: Lcf.Link; // { title: 'Contact', href: '/contact', target: '_self' }
	 */
	export interface Link {
		title?: string;
		href?: string;
		target?: string;
		prefetch?: InertiaLinkProps['prefetch'];
		rel?: string;
	}

	/**
	 * Ordered union of content blocks. CMS field: LcfFlexibleContent.
	 * Give each variant a distinct literal type and its own explicitly shaped data.
	 * Keep data required when supplied for that variant; omit it only for a data-less
	 * block. Narrow by block.type before reading block.data. The type discriminator
	 * is structural metadata, not an Lcf.Text or an editor-selectable Lcf.Select.
	 * @example
	 * content?: Lcf.FlexibleContent<
	 *   | { type: 'text'; data: { text: Lcf.Wysiwyg } }
	 *   | { type: 'image'; data: { image: Lcf.Image; caption?: Lcf.Text } }
	 * >;
	 */
	export type FlexibleContent<
		T extends {
			type: string;
			data?: Record<string, unknown>;
		},
	> = T[];

	/**
	 * Custom form content plus the required numeric form_id and optional stable form_name supplied at runtime.
	 * CMS field: LcfForm. Wrap each custom field in Lcf.FormField and keep submitted
	 * values, callbacks and frontend form state out of this CMS configuration shape.
	 * @example form: Lcf.Form<{ email: Lcf.FormField<{ label: Lcf.Text; placeholder: Lcf.Text }> }>;
	 */
	export type Form<T> = {
		form_id: number;
		form_name?: string;
	} & T;

	/**
	 * CMS configuration for one custom form field; preserves the declared field shape.
	 * The generator processes its inner fields rather than adding a runtime wrapper.
	 * Declare labels, options and validation messages here, not the submitted value.
	 * @example name: Lcf.FormField<{ label: Lcf.Text; placeholder: Lcf.Text; validation: { required_error: Lcf.Text } }>;
	 */
	export type FormField<T extends object & LcfFieldShape<T>> = LcfObjectValue<T>;
}
