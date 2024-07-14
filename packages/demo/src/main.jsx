import ReactDom from "@mini-react/react-dom";
import { useState } from "@mini-react/react";

const App = () => {
	const [num, setNum] = useState(1);
	window.setNum = setNum;
	return (
		<div>
			<div>{num === 3 ? <Child></Child> : <div>{num}</div>}</div>
		</div>
	);
};

const Child = () => {
	const [count, setCount] = useState(100);
	window.setCount = setCount;
	// const [num, setNum] = useState(200);
	return <div>{count}</div>;
};

ReactDom.createRoot(document.querySelector("#app")).render(<App />);
