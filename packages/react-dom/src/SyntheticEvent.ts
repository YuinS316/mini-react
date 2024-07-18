import { PropsType } from "@mini-react/shared/index";
import { Container } from "hostConfig";

//  合成事件
export const elementPropsKey = "__props";
const validEventTypeList = ["click"];

type EventCallback = (e: Event) => void;

interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}

//	分为冒泡事件和捕获事件
interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}

export interface DOMElement extends Element {
	[elementPropsKey]: PropsType;
}

export function updateFiberProps(node: DOMElement, props: PropsType) {
	node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
	if (!validEventTypeList.includes(eventType)) {
		console.warn("当前不支持的时间类型", eventType);
		return;
	}

	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
	const targetElement = e.target;

	if (targetElement === null) {
		console.warn("事件对象不存在", e);
		return;
	}

	//	1、收集沿途的事件
	const { bubble, capture } = collectPaths(
		targetElement as DOMElement,
		container,
		eventType
	);
	//	2、构造合成事件
	const se = createSyntheticEvent(e);

	//	3、遍历capture
	triggerEventFlow(capture, se);

	//	4、遍历bubble
	if (!se.__stopPropagation) {
		triggerEventFlow(bubble, se);
	}
}

/**
 * 建立合成事件
 * @param e
 */
function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;

	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};

	return syntheticEvent;
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		callback.call(null, se);

		if (se.__stopPropagation) {
			break;
		}
	}
}

function getEventCallbackNameFromEventType(eventType: string) {
	return {
		click: ["onClickCapture", "onClick"]
	}[eventType];
}

function collectPaths(
	targetElement: DOMElement,
	container: Container,
	eventType: string
) {
	const paths: Paths = {
		capture: [],
		bubble: []
	};

	while (targetElement && targetElement !== container) {
		//	收集
		const elementProps = targetElement[elementPropsKey];

		if (elementProps) {
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				//	["onClick", "onClickCapture"]
				callbackNameList.forEach((callbackName, i) => {
					const eventCallback = elementProps[callbackName];
					if (eventCallback) {
						if (i === 0) {
							//	capture
							//	因为capture是从最外层向内部触发
							//	而我们是从最内层往外收集
							paths.capture.unshift(eventCallback);
						} else {
							//	bubble
							paths.bubble.push(eventCallback);
						}
					}
				});
			}
		}

		targetElement = targetElement.parentNode as DOMElement;
	}

	return paths;
}
