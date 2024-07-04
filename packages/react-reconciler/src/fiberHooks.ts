import { FiberNode } from "./fiber";

export function renderWithHooks(wip: FiberNode) {
	//  此时wip.type是一个函数
	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	return children;
}
