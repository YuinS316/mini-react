import { REACT_ELEMENT_TYPE } from "@mini-react/shared/src/ReactSymbols";
import { it, expect, describe } from "vitest";
import { jsx } from "../jsx";

describe("react/jsx", () => {
	it("test jsx with children is single", () => {
		const type = "div";
		const key = "qwe";
		const ref = null;
		const children = "1234";
		const props = {
			id: 1
		};

		const result = jsx(type, { key, ref, ...props }, children);

		const expected = {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref,
			props: {
				...props,
				children: children
			},
			__mark: "by eazy"
		};

		expect(result).toEqual(expected);
	});
});
