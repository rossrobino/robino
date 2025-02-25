import { run, bench, boxplot } from "mitata";

const str = ":hello";

boxplot(() => {
	bench("slice", () => str.slice(1)).gc("inner");
	bench("substring", () => str.substring(1)).gc("inner");
	// result - no difference
});

boxplot(() => {
	bench("startsWith", () => str.startsWith(":")).gc("inner");
	bench("str.at(0) === x", () => str.at(0) === ":").gc("inner"); // slowest
	bench("str[0] === x", () => str[0] === ":").gc("inner"); // fastest
	bench("str.charAt(0) === x", () => str.charAt(0) === ":").gc("inner");
});

boxplot(() => {
	bench("at(-1)", () => str.at(-1)).gc("inner");
	bench("[str.length - 1]", () => str[str.length - 1]).gc("inner");
	bench("str.charAt(str.length - 1)", () => str.charAt(str.length - 1)).gc(
		"inner",
	);
});

await run();
