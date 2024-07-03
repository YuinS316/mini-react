import { FiberNode } from "./fiber";
import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance
} from "hostConfig";
import { WorkTag } from "./workTag";

export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case WorkTag.HostRoot: {
			bubbleProperties(wip);
			break;
		}
		case WorkTag.HostComponent: {
			if (current !== null && wip.stateNode) {
				//  stateNode存的是对应的dom节点，此时对应update
			} else {
				//  mount
				//  1、构建dom树
				const instance = createInstance(wip.type, newProps);
				//  2、dom树插入到对应的dom中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
				bubbleProperties(wip);
			}
			break;
		}
		case WorkTag.HostText: {
			const instance = createTextInstance(newProps.content);
			wip.stateNode = instance;
			bubbleProperties(wip);
			break;
		}
		default: {
			console.warn("completeWork出现未知的tag", wip);
			break;
		}
	}

	return null;
};

/**
 * 递归的将wip的dom挂载到parent的dom中
 * @param parent
 * @param wip
 */
function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;

	while (node !== null) {
		//  如果遇到了符合条件的，就挂载dom
		if (node.tag === WorkTag.HostComponent || node.tag === WorkTag.HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child !== null) {
			//  没遇到合适的就向下递归
			node.child.return = node;
			node = node.child;
			continue;
		}

		//  这是应对向上冒泡的情景，回到了wip就说明遍历完成了
		if (node === wip) {
			return;
		}

		//  遇到了死胡同就向上冒泡，找到叔叔节点
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

/**
 * 将wip其下子节点下的flag收集到subTreeFlags中
 * @param wip
 */
function bubbleProperties(wip: FiberNode) {
	let subTreeFlags = wip.subTreeFlags;
	let child = wip.child;

	while (child !== null) {
		subTreeFlags |= child.subTreeFlags;
		subTreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}

	wip.subTreeFlags |= subTreeFlags;
}
