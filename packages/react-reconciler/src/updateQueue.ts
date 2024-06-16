import { Action } from "@mini-react/shared";

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
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
export function createUpdateQueue<Action>() {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<Action>;
}

export function enqueueUpdate<Action>(
	updateQueue: UpdateQueue<Action>,
	update: Update<Action>
) {
	updateQueue.shared.pending = update;
}

export function processUpdateQueue<State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memorizedState: State } {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memorizedState: baseState
	};

	if (pendingUpdate !== null) {
		const { action } = pendingUpdate;
		if (action instanceof Function) {
			//  this.setState((state) => { return state + 1 })
			result.memorizedState = action(baseState);
		} else {
			//  this.setState(newState);
			result.memorizedState = action;
		}
	}

	return result;
}
