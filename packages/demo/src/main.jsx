import ReactDom from "@mini-react/react-dom";
import { useState } from "@mini-react/react";

const App = () => {
	const [num, setNum] = useState(1);
	// window.setNum = setNum;
	const onClick = (e) => {
		setNum(num + 1);
	};
	return (
		<div>
			<div>
				<div onClickCapture={onClick}>{num}</div>
			</div>
		</div>
	);
};

const Child = () => {
	const [count, setCount] = useState(100);
	// window.setCount = setCount;
	// const [num, setNum] = useState(200);

	return <div>{count}</div>;
};

ReactDom.createRoot(document.querySelector("#app")).render(<App />);
