/**
 * Content flags (§9 of the enhancement brief). A block whose real content is missing renders a
 * labelled placeholder in development and is left out of production builds altogether, so a
 * stand-in can never ship. `scripts/check-placeholders.mjs` backs this up after every build.
 *
 * Business facts that every page needs (brand name, phone…) are not gated here: they keep their
 * visible {{…}} chips and fail the production build until they are filled (see BUSINESS_INFO_REQUIRED.md).
 */
export const showPlaceholders = process.env.NODE_ENV !== "production";

/** True when an item is real and may render anywhere; placeholders only render in development. */
export const canShow = (ready: boolean) => ready || showPlaceholders;
