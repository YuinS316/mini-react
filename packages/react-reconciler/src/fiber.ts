import { PropsType, KeyType, RefType } from "@mini-react/shared";
import { WorkTag } from "./workTag";
import { FiberFlag } from "./fiberFlag";
import { Container } from "./hostConfig";
import { UpdateQueue } from "./updateQueue";

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
	memorizedState: any;
	alternate: FiberNode | null;
	flags: FiberFlag;
	updateQueue: UpdateQueue<any> | null;

	constructor(tag: WorkTag, pendingProps: PropsType, key: KeyType) {
		//==> 实例属性
		this.tag = tag;
		this.key = key;
		this.stateNode = null;
		this.type = null;
		this.ref = null;

		//==> fiber相关的属性
		this.return = null;
		this.child = null;
		this.sibling = null;
		this.index = 0;

		//==> 工作单元
		this.pendingProps = pendingProps;
		this.memorizedProps = null;
		this.memorizedState = null;
		this.alternate = null;
		this.updateQueue = null;

		//==> 副作用
		this.flags = FiberFlag.NoFlags;
	}
}

//	对应的是ReactDom.createRoot() 返回的 节点
//	这个节点比fiber特殊，会存一些全局的东西
export class FiberRootNode {
	container: Container;
	//	指向hostRootFiber，即根fiber
	current: FiberNode;
	//	指向更新完成后的hostRootFiber
	finishedWork: FiberNode | null;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export function createWorkInProgress(
	current: FiberNode,
	pendingProps: PropsType
): FiberNode {
	let wip = current.alternate;

	if (wip === null) {
		//	mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		//	update
		wip.pendingProps = pendingProps;
		wip.flags = FiberFlag.NoFlags;
	}

	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memorizedProps = current.memorizedProps;
	wip.memorizedState = current.memorizedState;

	return wip;
}