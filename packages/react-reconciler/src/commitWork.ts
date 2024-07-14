import { FiberNode, FiberRootNode } from "./fiber";
import { FiberFlag } from "./fiberFlag";
import {
	appendChildToContainer,
	commitUpdate,
	Container,
	removeChild
} from "hostConfig";
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
	//  执行placement操作
	if (hasFlag(finishedWork, FiberFlag.Placement)) {
		commitPlacement(finishedWork);
		//  执行完了，移除标记
		removeFlag(finishedWork, FiberFlag.Placement);
	}

	//	执行update操作
	if (hasFlag(finishedWork, FiberFlag.Update)) {
		commitUpdate(finishedWork);
		removeFlag(finishedWork, FiberFlag.Update);
	}

	//	执行deletion操作
	if (hasFlag(finishedWork, FiberFlag.ChildDeletion)) {
		const deletions = finishedWork.deletions;
		if (deletions !== null) {
			deletions.forEach((childToDelete) => {
				commitDeletion(childToDelete);
			});
		}
	}
}

function hasFlag(fiber: FiberNode, flag: FiberFlag) {
	const flags = fiber.flags;

	return (flags & flag) !== FiberFlag.NoFlags;
}

function removeFlag(fiber: FiberNode, flag: FiberFlag) {
	fiber.flags &= ~flag;
}

function commitPlacement(finishedWork: FiberNode) {
	console.warn("执行placement操作", finishedWork);

	//	向上递归找到父dom
	const hostParent = getHostParent(finishedWork);

	if (hostParent) {
		//	将离屏dom插入到父dom中
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
}

function commitDeletion(childToDeletion: FiberNode) {
	//	1、对于fc组件，需要执行useEffect的unmount操作，解绑ref
	//	2、对于host component需要解绑ref
	//	3、对于子树的根host component需要移除dom

	let rootHostNode: FiberNode | null = null;

	commitNestedComponent(childToDeletion, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case WorkTag.HostComponent: {
				if (rootHostNode === null) {
					rootHostNode = unmountFiber;
				}
				//	todo: 解绑ref
				break;
			}

			case WorkTag.HostText: {
				if (rootHostNode === null) {
					rootHostNode = unmountFiber;
				}
				break;
			}

			case WorkTag.FunctionComponent: {
				//	todo: useEffect unmount
				break;
			}

			default: {
				console.warn("commitDeletion 未处理的fiber类型", unmountFiber);
				break;
			}
		}
	});

	//	移除rootHostNode的dom
	if (rootHostNode !== null) {
		const hostParent = getHostParent(childToDeletion);
		if (hostParent) {
			removeChild((rootHostNode as FiberNode).stateNode, hostParent);
		}
	}
}

//	递归子树
function commitNestedComponent(
	root: FiberNode,
	onCommitUnMount: (fiber: FiberNode) => void
) {
	let node = root;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		onCommitUnMount(node);

		//	向下遍历
		if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === root) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === root) {
				return;
			}

			//	向上归
			node = node.return;
		}

		//	处理兄弟
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

/**
 * 递归向上寻找父dom
 * @param fiber
 * @returns
 */
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

/**
 * 递归的将fiber对应的dom插入到父dom中
 * @param finishedWork
 * @param hostParent
 * @returns
 */
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

	//	不是一个真实的host节点，就要考虑向下递归构建
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
