import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { createWorkInProgress, FiberNode, FiberRootNode } from "./fiber";
import { WorkTag } from "./workTag";

let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	//  调度
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

/**
 * 从触发更新的fiber，一直向上找到fiberRootNode
 * @param fiber
 * @returns
 */
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;

	//  一直向上递归，找到hostRootFiber
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}

	//  返回fiberRootNode
	if (node.tag === WorkTag.HostRoot) {
		return node.stateNode;
	}

	return null;
}

function renderRoot(root: FiberRootNode) {
	//  初始化
	prepareFreshStack(root);

	do {
		try {
			workLoop();
		} catch (e) {
			console.warn("workLoop异常", e);
			workInProgress = null;
		}
		// eslint-disable-next-line no-constant-condition
	} while (true);
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	//  深度优先，不断地获取子节点
	const next = beginWork(fiber);

	fiber.memorizedProps = fiber.pendingProps;

	if (next === null) {
		//  子节点没有了，获取兄弟节点
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);

		const sibling = node.sibling;

		//  有兄弟找兄弟，没兄弟找叔叔
		if (sibling !== null) {
			workInProgress = node.sibling;
			return;
		}

		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
