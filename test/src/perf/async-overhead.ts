import { run, bench, boxplot } from "mitata";

type MaybePromise<T> = T | Promise<T>;

const noCheck = async (a: MaybePromise<number>, b: MaybePromise<number>) => {
	return (await a) + (await b);
};

const check = async (a: MaybePromise<number>, b: MaybePromise<number>) => {
	if (a instanceof Promise) a = await a;
	if (b instanceof Promise) b = await b;

	return a + b;
};

const a = 5;
const b = 2;

boxplot(() => {
	bench("noCheck", () => noCheck(a, b)).gc("inner");
	bench("check", () => check(a, b)).gc("inner");
});

await run();
