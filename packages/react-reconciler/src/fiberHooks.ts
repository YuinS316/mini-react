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
	processUpdateQueue,
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
		currentDispatcher.current = HookDispatcherOnUpdate;
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
	workInProgressHook = null;
	currentHook = null;

	return children;
}

// =========	mount hook  =========

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
	hook.memoizedState = memoizedState;
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

// =========	update hook  =========
//	组件对应的hook链表
let currentHook: Hook | null = null;

const HookDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function updateState<State>(): [State, Dispatch<State>] {
	//	找到当前hook上次render对应的状态
	const hook = updateWorkInProgressHook();

	//	计算新state的逻辑
	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;

	if (pending !== null) {
		//	执行更新
		const { memoizedState } = processUpdateQueue(hook.memoizedState, pending);
		hook.memoizedState = memoizedState;
	}

	return [hook.memoizedState, queue.dispatch!];
}

function updateWorkInProgressHook(): Hook {
	let nextCurrentHook: Hook | null = null;

	if (currentHook === null) {
		//	取当前fiber的第一个hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			//	拿到hook链表
			nextCurrentHook = current?.memoizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		nextCurrentHook = currentHook.next;
	}

	//	有一种边界情况，就是update的时候，hook数量变多了，这是不被允许的
	//	mount   u1 u2 u3
	//	update  u1 u2 u3 u4
	//	此时update通过 拿到的旧u3.next 为 null
	if (nextCurrentHook === null) {
		throw new Error(`更新组件${currentlyRenderingFiber?.type}, hook数量增多`);
	}

	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};

	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			throw new Error("请在函数组件调用hook");
		} else {
			workInProgressHook = newHook;
			//  函数式组件的memoizedState存储着hook链表
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}

	return workInProgressHook;
}
