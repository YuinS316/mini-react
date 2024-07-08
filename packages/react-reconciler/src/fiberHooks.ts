import { Action } from "@shared/index";
import currentDispatcher, {
	Dispatch,
	Dispatcher
} from "@mini-react/react/src/currentDispatcher";
import { FiberNode } from "./fiber";
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";

interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

//  正在处理的fiber节点
let currentlyRenderingFiber: FiberNode | null = null;
//  正在处理的hook
let workInProgressHook: Hook | null = null;

export function renderWithHooks(wip: FiberNode) {
	//  赋值
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;

	const current = wip.alternate;

	if (current !== null) {
		//  update
	} else {
		//  mount
		currentDispatcher.current = HookDispatcherOnMount;
	}

	//  此时wip.type是一个函数
	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	//  重置
	currentlyRenderingFiber = null;

	return children;
}

const HookDispatcherOnMount: Dispatcher = {
	useState: mountState
};

function mountState<State>(
	initialState: State | (() => State)
): [State, Dispatch<State>] {
	const hook = mountWorkInProgressHook();

	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}

	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;

	//  @ts-ignore
	const dispatch = dispatchSetState.bind(this, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;

	return [memoizedState, dispatch];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};

	//  挂载的时候，第一个hook会进入if，后续会进入else
	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			throw new Error("请在函数组件调用hook");
		} else {
			workInProgressHook = hook;
			//  函数式组件的memoizedState存储着hook链表
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}

	return workInProgressHook;
}
