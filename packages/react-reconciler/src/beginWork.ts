import { ElementType, ReactElement } from "@mini-react/shared";
import { mountChildFibers, reconcileChildFibers } from "./childFibers";
import { FiberNode } from "./fiber";
import { processUpdateQueue, UpdateQueue } from "./updateQueue";
import { WorkTag } from "./workTag";

/**
 * 将wip的child处理成fiber
 * @param wip
 * @returns
 */
export const beginWork = (wip: FiberNode): FiberNode | null => {
	switch (wip.tag) {
		case WorkTag.HostRoot: {
			return updateHostRoot(wip);
		}
		case WorkTag.HostComponent: {
			return updateHostComponent(wip);
		}
		case WorkTag.HostText: {
			return null;
		}
		default: {
			console.warn("beginWork出现未知的tag类型", wip);
			return null;
		}
	}
};

function updateHostRoot(wip: FiberNode) {
	//	此时的wip是fiberRootNode

	//	1、此时调用ReactDom.createRoot().render();  render是触发了更新
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<ElementType>;
	const pending = updateQueue.shared.pending;

	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	//	2、触发更新返回的 memoizedState 是个Element，也就是hostFiberRoot
	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);

	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	//	对于此时的节点为 <div class="a"> <div class="b" /> </div>
	//	他需要处理的是把子节点转成fiber

	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElement) {
	const current = wip.alternate;

	if (current !== null) {
		//	update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		//	mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
