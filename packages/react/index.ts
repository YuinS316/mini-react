import currentDispatcher, {
	Dispatcher,
	resolveDispatcher
} from "./src/currentDispatcher";
import { jsx } from "./src/jsx";

export const useState: Dispatcher["useState"] = (initialState) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

export const __SECRET_INTERNALS = {
	currentDispatcher
};

export default {
	version: "0.0.0",
	createElement: jsx
};
