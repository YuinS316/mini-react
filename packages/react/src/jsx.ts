import { REACT_ELEMENT_TYPE } from "@mini-react/shared/src/ReactSymbols";
import {
	ElementType,
	PropsType,
	ReactElement,
	RefType,
	Type,
	KeyType
} from "shared/src/ReactTypes";

const ReactElement = function (
	type: Type,
	key: KeyType,
	ref: RefType,
	props: PropsType
): ReactElement {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: "by eazy"
	};

	return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
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

	if (maybeChildren && maybeChildren.length > 0) {
		props.children = maybeChildren;
	}

	return ReactElement(type, key, ref, props);
};
