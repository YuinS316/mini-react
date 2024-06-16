import { REACT_ELEMENT_TYPE } from "@mini-react/shared/src/ReactSymbols";
import {
	ElementType,
	PropsType,
	ReactElement,
	RefType,
	Type,
	KeyType
} from "shared/src/ReactTypes";

const createReactElement = function (
	type: Type,
	key: KeyType,
	ref: RefType,
	props: PropsType
): ReactElement {
	const element = {
		//	内部字段，用来指出这个数据结构是react element
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		//	自定义字段，用来区分出react和自己实现的element
		__mark: "by eazy"
	};

	return element;
};

export const jsx = (
	type: ElementType,
	config: any,
	...maybeChildren: any[]
) => {
	let key: KeyType = null;
	const props: PropsType = {};
	let ref: RefType = null;

	for (const propName in config) {
		const val = config[propName];

		switch (propName) {
			case "key": {
				if (val !== undefined) {
					key = "" + val;
				}
				break;
			}
			case "ref": {
				if (val !== undefined) {
					ref = val;
				}
				break;
			}
			default: {
				props[propName] = val;
				break;
			}
		}
	}

	const length = maybeChildren.length;

	if (length === 1) {
		props.children = maybeChildren[0];
	} else {
		props.children = maybeChildren;
	}

	return createReactElement(type, key, ref, props);
};

export const jsxDev = jsx;
