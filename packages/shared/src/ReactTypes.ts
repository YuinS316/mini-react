export type Type = any;
export type KeyType = any;
export type RefType = any;
export type PropsType = any;
export type ElementType = any;

export interface ReactElement {
	$$typeof: symbol | number;
	type: ElementType;
	key: KeyType;
	props: PropsType;
	ref: RefType;
	__mark: string;
}
