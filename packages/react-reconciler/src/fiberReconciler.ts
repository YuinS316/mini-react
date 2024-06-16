import { ReactElement } from "shared";
import { FiberNode, FiberRootNode } from "./fiber";
import { Container } from "./hostConfig";
import { createUpdate, createUpdateQueue, enqueueUpdate } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";
import { WorkTag } from "./workTag";

export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(WorkTag.HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

export function updateContainer(
	element: ReactElement | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const update = createUpdate(element);

	if (hostRootFiber.updateQueue)
		enqueueUpdate(hostRootFiber.updateQueue, update);

	scheduleUpdateOnFiber(hostRootFiber);

	return element;
}
