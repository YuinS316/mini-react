import {
	ElementType,
	ReactElement,
	REACT_ELEMENT_TYPE
} from "@mini-react/shared";
import { createFiberFromElement, FiberNode } from "./fiber";
import { FiberFlag } from "./fiberFlag";
import { WorkTag } from "./workTag";

/**
 * 返回闭包构建子fibers
 * @param shouldTrackEffects 是否追踪副作用
 * @returns
 */
function childReconciler(shouldTrackEffects: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ElementType
	) {
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string
	) {
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

		if (typeof newChild === "string" || typeof newChild === "number") {
			//  对应文本节点
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		return null;
	};
}

export const reconcileChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);
