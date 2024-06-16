import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { FiberNode } from "./fiber";

let workInProgress: FiberNode | null = null;

function prepartFreshStack(fiber: FiberNode) {
	workInProgress = fiber;
}

function renderRoot(root: FiberNode) {
	//  初始化
	prepartFreshStack(root);

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
