/**
 * Fast hashing algorithm for generating etags
 * http://www.cse.yorku.ca/~oz/hash.html
 *
 * Copied from SvelteKit
 * https://github.com/sveltejs/kit/blob/25d459104814b0c2dc6b4cf73b680378a29d8200/packages/kit/src/runtime/hash.js
 */
export const hash = (...values: (string | ArrayBufferView)[]) => {
	let hash = 5381;

	for (const value of values) {
		if (typeof value === "string") {
			let i = value.length;
			while (i) hash = (hash * 33) ^ value.charCodeAt(--i);
		} else if (ArrayBuffer.isView(value)) {
			const buffer = new Uint8Array(
				value.buffer,
				value.byteOffset,
				value.byteLength,
			);
			let i = buffer.length;
			while (i) hash = (hash * 33) ^ buffer[--i]!;
		} else {
			throw new TypeError("value must be a string or an ArrayBuffer view");
		}
	}

	return (hash >>> 0).toString(36);
};
