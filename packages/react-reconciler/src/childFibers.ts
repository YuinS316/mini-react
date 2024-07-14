import {
	ElementType,
	PropsType,
	ReactElement,
	REACT_ELEMENT_TYPE
} from "@mini-react/shared";
import {
	createFiberFromElement,
	createWorkInProgress,
	FiberNode
} from "./fiber";
import { FiberFlag } from "./fiberFlag";
import { WorkTag } from "./workTag";

/**
 * 返回闭包构建子fibers
 * @param shouldTrackEffects 是否追踪副作用
 * @returns
 */
function childReconciler(shouldTrackEffects: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffects) {
			return;
		}

		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [];
		}
		returnFiber.deletions?.push(childToDelete);
		returnFiber.flags |= FiberFlag.ChildDeletion;
	}

	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ElementType
	): FiberNode {
		if (currentFiber !== null) {
			//	update
			if (currentFiber.key === element.key) {
				//	key相同
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === element.type) {
						//	type相同，复用
						const existing = useFiber(currentFiber, element.props);
						existing.return = returnFiber;
						return existing;
					}
					//	key相同，type不同
					deleteChild(returnFiber, currentFiber);
				} else {
					console.warn("未实现的react类型", element);
					// deleteChild(returnFiber, currentFiber);
				}
			} else {
				//	删除旧节点
				deleteChild(returnFiber, currentFiber);
			}
		}

		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string
	): FiberNode {
		if (currentFiber !== null) {
			//	update
			if (currentFiber.tag === WorkTag.HostText) {
				//	可以复用
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				return existing;
			}
		}

		const fiber = new FiberNode(WorkTag.HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	function placeSingleChild(fiber: FiberNode) {
		//  挂载的情况
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= FiberFlag.Placement;
		}
		return fiber;
	}

	return function reconcileFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElement
	) {
		//	react element
		if (typeof newChild === "object" && newChild !== null) {
			if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
				//  对应react element节点
				return placeSingleChild(
					reconcileSingleElement(returnFiber, currentFiber, newChild)
				);
			} else {
				console.warn("未处理的reconcile类型", newChild);
			}
		}

		//	host text
		if (typeof newChild === "string" || typeof newChild === "number") {
			//  对应文本节点
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		if (currentFiber !== null) {
			console.warn("兜底删除fiber==>", currentFiber);
			deleteChild(returnFiber, currentFiber);
		}

		console.warn("没有实现的reconcile类型", newChild);

		return null;
	};
}

/**
 * 复用fiber
 * @param fiber
 * @param pendingProps
 * @returns
 */
function useFiber(fiber: FiberNode, pendingProps: PropsType) {
	const clonedFiber = createWorkInProgress(fiber, pendingProps);
	clonedFiber.index = 0;
	clonedFiber.sibling = null;
	return clonedFiber;
}

export const reconcileChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);
