import type { Props } from "../types/index.js";

/**
 * @param attr attributes
 * @returns string of attributes
 */
export const serializeAttr = (attr?: Props) => {
	let str = "";

	for (let key in attr) {
		const value = attr[key];

		if (key === "className") key = "class";
		else if (key === "htmlFor") key = "for";

		if (value === true) {
			// just put the key without the value
			str += ` ${key}`;
		} else if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "bigint"
		) {
			str += ` ${key}=${JSON.stringify(value)}`;
		}
		// otherwise, don't include the attribute
	}

	return str;
};
