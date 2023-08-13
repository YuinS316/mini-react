import { it, expect, describe } from "vitest";
import { REACT_ELEMENT_TYPE } from "../ReactSymbols";

describe("shared/ReactSymbols", () => {
	it("should register symbols", () => {
		expect(REACT_ELEMENT_TYPE).toBe(Symbol.for("react.element"));
	});
});
