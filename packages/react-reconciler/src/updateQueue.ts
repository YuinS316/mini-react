import { Action } from "@mini-react/shared";
import { Dispatch } from "react/src/currentDispatcher";

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

/**
 * 创建更新部分的数据结构
 * @param action
 * @returns
 */
export function createUpdate<State>(action: Action<State>) {
	return {
		action
	};
}

/**
 * 创建消费update的数据结构
 * @returns
 */
export function createUpdateQueue<State>() {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
}

export function enqueueUpdate<State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) {
	updateQueue.shared.pending = update;
}

export function processUpdateQueue<State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};

	if (pendingUpdate !== null) {
		const { action } = pendingUpdate;
		if (action instanceof Function) {
			//  this.setState((state) => { return state + 1 })
			result.memoizedState = action(baseState);
		} else {
			//  this.setState(newState);
			result.memoizedState = action;
		}
	}

	return result;
}
