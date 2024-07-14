import { FiberNode } from "@mini-react/react-reconciler/src/fiber";
import { WorkTag } from "@mini-react/react-reconciler/src/workTag";

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

//  创建dom节点
export function createInstance(type: string, props: any) {
	const element = document.createElement(type);

	//  处理props

	return element;
}

//	创建文本节点
export function createTextInstance(content: string) {
	return document.createTextNode(content);
}

//	添加子节点
export function appendInitialChild(
	parent: Instance | Container,
	child: Instance
) {
	parent.appendChild(child);
}

export const appendChildToContainer = appendInitialChild;

export function commitUpdate(fiber: FiberNode) {
	switch (fiber.tag) {
		case WorkTag.HostRoot: {
			break;
		}

		case WorkTag.HostText: {
			//	更新文本信息
			commitTextUpdate(fiber.stateNode, fiber.memoizedProps.content);
			break;
		}

		case WorkTag.HostComponent: {
			break;
		}

		case WorkTag.FunctionComponent: {
			break;
		}

		default: {
			console.log("未实现的update类型", fiber);
			break;
		}
	}
}

//	更新文本节点
export function commitTextUpdate(textInstance: TextInstance, content: string) {
	textInstance.textContent = content;
}

export function removeChild(
	child: Instance | TextInstance,
	container: Container
) {
	container.removeChild(child);
}
