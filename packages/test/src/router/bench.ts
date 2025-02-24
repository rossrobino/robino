import { FetchRouter } from "@robino/router";
import { Hono } from "hono";
import { run, bench, boxplot } from "mitata";
import { Trouter } from "trouter";

const r = async (_c: any) => new Response();

const router = new FetchRouter({
	notFound: (c) => {
		throw new Error(c?.url?.pathname + " not found");
	},
	trailingSlash: null,
});

const hono = new Hono();

const trouter = new Trouter();

router
	.get("/", r)
	.get("/foo", r)
	.get("/foo/bar", r)
	.get("/foo/bar/baz", r)
	.get("/foo/bar/baz/qux", r)
	.get("/foo/bar/baz/qux/quux", r)
	.get("/1/:foo", r)
	.get("/2/:foo", r)
	.get("/3/:foo", r)
	.get("/4/:foo", r)
	.get("/5/:foo", r)
	.get("/6/:foo", r)
	.get("/params/:foo", r)
	.get("/params/:foo/:bar", r)
	.get("/params/:foo/:bar/:baz", r)
	.get("/params/:foo/:bar/:baz/:qux", r)
	.get("/params/foo/:bar/:baz/:qux/:quux", r)
	.get("/params/:foo/bar/:baz/:qux/:quux", r)
	.get("/params/:foo/:bar/baz/:qux/:quux", r)
	.get("/params/:foo/:bar/:baz/qux/:quux", r)
	.get("/params/:foo/:bar/:baz/:qux/quux", r);

hono
	.get("/", r)
	.get("/foo", r)
	.get("/foo/bar", r)
	.get("/foo/bar/baz", r)
	.get("/foo/bar/baz/qux", r)
	.get("/foo/bar/baz/qux/quux", r)
	.get("/1/:foo", r)
	.get("/2/:foo", r)
	.get("/3/:foo", r)
	.get("/4/:foo", r)
	.get("/5/:foo", r)
	.get("/6/:foo", r)
	.get("/params/:foo", r)
	.get("/params/:foo/:bar", r)
	.get("/params/:foo/:bar/:baz", r)
	.get("/params/:foo/:bar/:baz/:qux", r)
	.get("/params/foo/:bar/:baz/:qux/:quux", r)
	.get("/params/:foo/bar/:baz/:qux/:quux", r)
	.get("/params/:foo/:bar/baz/:qux/:quux", r)
	.get("/params/:foo/:bar/:baz/qux/:quux", r)
	.get("/params/:foo/:bar/:baz/:qux/quux", r);

trouter
	.get("/", r)
	.get("/foo", r)
	.get("/foo/bar", r)
	.get("/foo/bar/baz", r)
	.get("/foo/bar/baz/qux", r)
	.get("/foo/bar/baz/qux/quux", r)
	.get("/1/:foo", r)
	.get("/2/:foo", r)
	.get("/3/:foo", r)
	.get("/4/:foo", r)
	.get("/5/:foo", r)
	.get("/6/:foo", r)
	.get("/params/:foo", r)
	.get("/params/:foo/:bar", r)
	.get("/params/:foo/:bar/:baz", r)
	.get("/params/:foo/:bar/:baz/:qux", r)
	.get("/params/foo/:bar/:baz/:qux/:quux", r)
	.get("/params/:foo/bar/:baz/:qux/:quux", r)
	.get("/params/:foo/:bar/baz/:qux/:quux", r)
	.get("/params/:foo/:bar/:baz/qux/:quux", r)
	.get("/params/:foo/:bar/:baz/:qux/quux", r);

boxplot(() => {
	bench("init", () => {
		new FetchRouter();
	});

	bench("hono init", () => {
		new Hono();
	});

	bench("trouter init", () => {
		new Trouter();
	});
});

boxplot(() => {
	bench("init and add routes", () => {
		new FetchRouter()
			.get("/", r)
			.get("/foo", r)
			.get("/foo/bar", r)
			.get("/foo/bar/baz", r)
			.get("/foo/bar/baz/qux", r)
			.get("/foo/bar/baz/qux/quux", r)
			.get("/1/:foo", r)
			.get("/2/:foo", r)
			.get("/3/:foo", r)
			.get("/4/:foo", r)
			.get("/5/:foo", r)
			.get("/6/:foo", r)
			.get("/params/:foo", r)
			.get("/params/:foo/:bar", r)
			.get("/params/:foo/:bar/:baz", r)
			.get("/params/:foo/:bar/:baz/:qux", r)
			.get("/params/foo/:bar/:baz/:qux/:quux", r)
			.get("/params/:foo/bar/:baz/:qux/:quux", r)
			.get("/params/:foo/:bar/baz/:qux/:quux", r)
			.get("/params/:foo/:bar/:baz/qux/:quux", r)
			.get("/params/:foo/:bar/:baz/:qux/quux", r);
	});

	bench("hono init and add routes", () => {
		new Hono()
			.get("/", r)
			.get("/foo", r)
			.get("/foo/bar", r)
			.get("/foo/bar/baz", r)
			.get("/foo/bar/baz/qux", r)
			.get("/foo/bar/baz/qux/quux", r)
			.get("/1/:foo", r)
			.get("/2/:foo", r)
			.get("/3/:foo", r)
			.get("/4/:foo", r)
			.get("/5/:foo", r)
			.get("/6/:foo", r)
			.get("/params/:foo", r)
			.get("/params/:foo/:bar", r)
			.get("/params/:foo/:bar/:baz", r)
			.get("/params/:foo/:bar/:baz/:qux", r)
			.get("/params/foo/:bar/:baz/:qux/:quux", r)
			.get("/params/:foo/bar/:baz/:qux/:quux", r)
			.get("/params/:foo/:bar/baz/:qux/:quux", r)
			.get("/params/:foo/:bar/:baz/qux/:quux", r)
			.get("/params/:foo/:bar/:baz/:qux/quux", r);
	});

	bench("trouter init and add routes", () => {
		new Trouter()
			.get("/", r)
			.get("/foo", r)
			.get("/foo/bar", r)
			.get("/foo/bar/baz", r)
			.get("/foo/bar/baz/qux", r)
			.get("/foo/bar/baz/qux/quux", r)
			.get("/1/:foo", r)
			.get("/2/:foo", r)
			.get("/3/:foo", r)
			.get("/4/:foo", r)
			.get("/5/:foo", r)
			.get("/6/:foo", r)
			.get("/params/:foo", r)
			.get("/params/:foo/:bar", r)
			.get("/params/:foo/:bar/:baz", r)
			.get("/params/:foo/:bar/:baz/:qux", r)
			.get("/params/foo/:bar/:baz/:qux/:quux", r)
			.get("/params/:foo/bar/:baz/:qux/:quux", r)
			.get("/params/:foo/:bar/baz/:qux/:quux", r)
			.get("/params/:foo/:bar/:baz/qux/:quux", r)
			.get("/params/:foo/:bar/:baz/:qux/quux", r);
	});
});

const benchReq = (pathname: string, router: Hono | FetchRouter) => {
	bench(`${"delete" in router ? "hono" : ""} ${pathname}`, async () => {
		await router.fetch(new Request(`http://localhost:5173${pathname}`));
	}).gc("inner");
};

const benchTrouter = (pathname: string) => {
	bench(`trouter ${pathname}`, async () => {
		const req = new Request(`http://localhost:5173${pathname}`);
		const url = new URL(req.url);
		const { handlers, params } = trouter.find("GET", url.pathname);

		if (handlers[0]) await handlers[0]({ req, url, params });
	});
};

boxplot(() => {
	benchReq("/", router);
	benchReq("/", hono);
	benchTrouter("/");
});

boxplot(() => {
	benchReq("/foo/bar", router);
	benchReq("/foo/bar", hono);
	benchTrouter("/foo/bar");
});

boxplot(() => {
	benchReq("/foo/bar/baz", router);
	benchReq("/foo/bar/baz", hono);
	benchTrouter("/foo/bar/baz");
});

boxplot(() => {
	benchReq("/foo/bar/baz/qux", router);
	benchReq("/foo/bar/baz/qux", hono);
	benchTrouter("/foo/bar/baz/qux");
});

boxplot(() => {
	benchReq("/foo/bar/baz/qux/quux", router);
	benchReq("/foo/bar/baz/qux/quux", hono);
	benchTrouter("/foo/bar/baz/qux/quux");
});

boxplot(() => {
	benchReq("/params/test", router);
	benchReq("/params/test", hono);
	benchTrouter("/params/test");
});

boxplot(() => {
	benchReq("/params/test/test", router);
	benchReq("/params/test/test", hono);
	benchTrouter("/params/test/test");
});

boxplot(() => {
	benchReq("/params/test/test/test", router);
	benchReq("/params/test/test/test", hono);
	benchTrouter("/params/test/test/test");
});

boxplot(() => {
	benchReq("/params/test/test/test/test", router);
	benchReq("/params/test/test/test/test", hono);
	benchTrouter("/params/test/test/test/test");
});

boxplot(() => {
	benchReq("/params/foo/test/test/test/test", router);
	benchReq("/params/foo/test/test/test/test", hono);
	benchTrouter("/params/foo/test/test/test/test");
});

boxplot(() => {
	benchReq("/params/test/bar/test/test/test", router);
	benchReq("/params/test/bar/test/test/test", hono);
	benchTrouter("/params/test/bar/test/test/test");
});

boxplot(() => {
	benchReq("/params/test/test/baz/test/test", router);
	benchReq("/params/test/test/baz/test/test", hono);
	benchTrouter("/params/test/test/baz/test/test");
});

boxplot(() => {
	benchReq("/params/test/test/test/qux/test", router);
	benchReq("/params/test/test/test/qux/test", hono);
	benchTrouter("/params/test/test/test/qux/test");
});

boxplot(() => {
	benchReq("/params/test/test/test/test/quux", router);
	benchReq("/params/test/test/test/test/quux", hono);
	benchTrouter("/params/test/test/test/test/quux");
});

await run();
