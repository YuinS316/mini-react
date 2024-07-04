import ReactDom from "@mini-react/react-dom";

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
	return <div>child</div>;
};

ReactDom.createRoot(document.querySelector("#app")).render(App);
