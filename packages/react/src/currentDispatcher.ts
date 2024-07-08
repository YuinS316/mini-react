import { Action } from "@shared/index";

export interface Dispatcher {
	useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
}

export type Dispatch<State> = (action: Action<State>) => void;
//  const [count, setCount] = useState(0);
//  const [count, setCount] = useState(() => props.num + 1);
//  setCount(1);
//  setCount((state) => state + 1);

const currentDispatcher: { current: Dispatcher | null } = {
	current: null
};

export const resolveDispatcher = () => {
	const dispatcher = currentDispatcher.current;

	if (dispatcher === null) {
		throw new Error("hook只能在函数式组件中使用");
	}

	return dispatcher;
};

export default currentDispatcher;
