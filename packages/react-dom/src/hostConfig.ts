export type Container = Element;
export type Instance = Element;

//  创建dom节点
export function createInstance(type: string, props: any) {
	const element = document.createElement(type);

	//  处理props

	return element;
}

export function createTextInstance(content: string) {
	return document.createTextNode(content);
}

export function appendInitialChild(
	parent: Instance | Container,
	child: Instance
) {
	parent.appendChild(child);
}

export const appendChildToContainer = appendInitialChild;
