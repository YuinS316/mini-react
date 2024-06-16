import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgPath = resolve(__dirname, "../../packages");
const distPath = resolve(__dirname, "../../dist/node_modules");

/**
 * 获取包对应的文件路径
 * @param pkgName 包名
 * @param isDist 是否为打包后的路径
 * @returns
 */
export function resolvePkgPath(pkgName: string, isDist = false): string {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}

	return `${pkgPath}/${pkgName}`;
}

/**
 * 获取包对应的package.json文件内容
 * @param pkgName 包名
 * @returns
 */
export function getPackageJSON(pkgName: string) {
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const content = fs.readFileSync(path, { encoding: "utf-8" });
	return JSON.parse(content);
}
