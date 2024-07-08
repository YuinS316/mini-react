import ReactDom from "@mini-react/react-dom";
import { useState } from "@mini-react/react";

const App = () => {
	return (
		<div>
			<div>
				<Child></Child>
			</div>
		</div>
	);
};

const Child = () => {
	const [count, setCount] = useState(100);
	const [num, setNum] = useState(200);
	return <div>{count}</div>;
};

ReactDom.createRoot(document.querySelector("#app")).render(App);
