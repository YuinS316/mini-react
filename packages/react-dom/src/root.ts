//  ReactDom.createRoot(root).render(<App />);

import {
	createContainer,
	updateContainer
} from "@mini-react/react-reconciler/src/fiberReconciler";
import { ReactElement } from "@mini-react/shared";
import { Container } from "./hostConfig";
import { initEvent } from "./SyntheticEvent";

export function createRoot(container: Container) {
	const root = createContainer(container);

	return {
		render(element: ReactElement) {
			initEvent(container, "click");
			updateContainer(element, root);
		}
	};
}
