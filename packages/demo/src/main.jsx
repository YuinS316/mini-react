import ReactDom from "@mini-react/react-dom";

const App = () => {
	return (
		<div>
			<span>hello react</span>
		</div>
	);
};

ReactDom.createRoot(document.querySelector("#app")).render(App());
