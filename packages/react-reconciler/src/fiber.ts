import { PropsType, KeyType, RefType, ReactElement } from "@mini-react/shared";
import { WorkTag } from "./workTag";
import { FiberFlag } from "./fiberFlag";
import { Container } from "hostConfig";
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
	memoizedProps: PropsType | null;
	memoizedState: any;
	alternate: FiberNode | null;
	flags: FiberFlag;
	subTreeFlags: FiberFlag;
	updateQueue: UpdateQueue<any> | null;
	deletions: FiberNode[] | null;

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
		this.memoizedProps = null;
		this.memoizedState = null;
		this.alternate = null;
		this.updateQueue = null;

		//==> 副作用
		this.flags = FiberFlag.NoFlags;
		this.subTreeFlags = FiberFlag.NoFlags;
		this.deletions = null;
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
		wip.subTreeFlags = FiberFlag.NoFlags;
		wip.deletions = null;
	}

	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
}

export function createFiberFromElement(element: ReactElement) {
	const { type, key, props } = element;

	const fiber = new FiberNode(WorkTag.FunctionComponent, props, key);
	fiber.type = type;

	if (typeof type === "string") {
		//	对应<div>
		fiber.tag = WorkTag.HostComponent;
	} else if (typeof type !== "function") {
		console.warn("未定义的type类型", element);
	}

	return fiber;
}
