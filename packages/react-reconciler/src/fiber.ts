import { PropsType, KeyType, RefType } from "@mini-react/shared";
import { WorkTag } from "./workTag";
import { FiberFlag } from "./fiberFlag";

export class FiberNode {
	tag: WorkTag;
	key: KeyType;
	//  如果是HostComponent，则对应了其真实dom
	stateNode: any;
	//  如果是FunctionComponent，则对应的是function
	type: any;
	ref: RefType;

	return: FiberNode | null;
	child: FiberNode | null;
	sibling: FiberNode | null;
	//  假设他有多个兄弟节点，表示自己是第几个
	index: number;

	//  在成为工作单元前的props
	pendingProps: PropsType;
	//  工作单元执行后的props
	memorizedProps: PropsType | null;
	alternate: FiberNode | null;
	flags: FiberFlag;

	constructor(tag: WorkTag, pendingProps: PropsType, key: KeyType) {
		//==>  实例属性
		this.tag = tag;
		this.key = key;
		this.stateNode = null;
		this.type = null;
		this.ref = null;

		//==>  fiber相关的属性
		this.return = null;
		this.child = null;
		this.sibling = null;
		this.index = 0;

		//==>  工作单元
		this.pendingProps = pendingProps;
		this.memorizedProps = null;
		this.alternate = null;
		this.flags = FiberFlag.NoFlags;
	}
}
