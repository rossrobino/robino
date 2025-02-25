import { App } from "./basic.js";
import { run, bench, boxplot } from "mitata";

boxplot(() => {
	bench("basic", async () => await App()).gc("inner");
});

await run();
