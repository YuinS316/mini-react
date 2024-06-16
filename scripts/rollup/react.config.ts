import { getPackageJSON, resolvePkgPath } from "./utils";

const { name, module } = getPackageJSON("react");

//  react包的路径
const pkgPath = resolvePkgPath("react");
//  react产物的路径
const pkgDistPath = resolvePkgPath(name, true);

console.log("pkgPath==>", pkgPath);

export default [
	{
		input: `${pkgPath}/${module}`,
		output: {
			file: `${pkgDistPath}`,
			name: "index.js",
			format: "umd"
		}
	}
];
