import { run, bench, boxplot } from "mitata";

const arr = Array.from({ length: 3 }, () => Math.random());
const s = new Set(arr);

const array = () => {
	arr.includes(0.5);
};

const set = () => {
	s.has(0.5);
};

boxplot(() => {
	bench("array", () => array()).gc("inner");
	bench("set", () => set()).gc("inner");
});

await run();
