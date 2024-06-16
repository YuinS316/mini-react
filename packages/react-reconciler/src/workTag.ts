export const enum WorkTag {
	//  函数式组件
	FunctionComponent = 0,
	//  根节点，即ReactDom.render挂载的那个
	HostRoot = 3,
	//  <div>之类的
	HostComponent = 5,
	//  <div>123</div> 中间的text文本
	HostText = 6
}
