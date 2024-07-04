import { FiberNode, FiberRootNode } from "./fiber";
import { FiberFlag } from "./fiberFlag";
import { appendChildToContainer, Container } from "hostConfig";
import { WorkTag } from "./workTag";

let nextEffect: FiberNode | null = null;

export function commitMutationEffects(finishedWork: FiberNode) {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		//  向下遍历
		const child: FiberNode | null = nextEffect.child;

		//  判断其下subtree是否有需要执行mutation
		const hasMutationMaskFlag = (fiber: FiberNode) =>
			(fiber.subTreeFlags & FiberFlag.MutationMask) !== FiberFlag.NoFlags;

		if (child !== null && hasMutationMaskFlag(nextEffect)) {
			nextEffect = child;
		} else {
			//  可能找到底 或者 子节点不包含对应的subtreeFlags
			//  说明此时对应的fiber有placment之类的操作，就要处理了

			//  向上遍历
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);

				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}

				nextEffect = nextEffect.return;
			}
		}
	}
}

/**
 * 具体的fiber执行mutation操作
 * @param finishedWork
 */
function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
	const flags = finishedWork.flags;

	//  执行placement操作
	if ((flags & FiberFlag.Placement) !== FiberFlag.NoFlags) {
		commitPlacement(finishedWork);
		//  执行完了，移除标记
		removeFlag(finishedWork, FiberFlag.Placement);
	}
}

function removeFlag(fiber: FiberNode, flag: FiberFlag) {
	fiber.flags &= ~flag;
}

function commitPlacement(finishedWork: FiberNode) {
	console.warn("执行placement操作", finishedWork);

	const hostParent = getHostParent(finishedWork);

	if (hostParent) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
}

function getHostParent(fiber: FiberNode): Container | null {
	let parent = fiber.return;

	while (parent) {
		const parentTag = parent.tag;

		if (parentTag === WorkTag.HostComponent) {
			return parent.stateNode as Container;
		}

		if (parentTag === WorkTag.HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}

		parent = parent.return;
	}

	console.warn("未找到host parent");

	return null;
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	//  希望是一个实际存在的host节点
	const hostTags = [WorkTag.HostComponent, WorkTag.HostText];
	if (hostTags.includes(finishedWork.tag)) {
		appendChildToContainer(hostParent, finishedWork.stateNode);
		return;
	}

	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);

		let sibling = child.sibling;
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
