class IterableHandler<T> {
	index: number;
	iterator: AsyncIterator<T>;
	promise: Promise<{ result: IteratorResult<T>; handler: IterableHandler<T> }>;

	constructor(index: number, iterable: AsyncIterable<T>) {
		this.index = index;
		this.iterator = iterable[Symbol.asyncIterator]();
		this.promise = this.advance();
	}

	advance() {
		return (this.promise = this.iterator.next().then((result) => ({
			result,
			handler: this,
		})));
	}
}

/**
 * @param iterables `AsyncIterable` array to merge into one
 */
export async function* mergeAsyncIterables<T>(iterables: AsyncIterable<T>[]) {
	const handlers = new Set<IterableHandler<T>>();

	for (let i = 0; i < iterables.length; i++)
		handlers.add(new IterableHandler<T>(i, iterables[i]!));

	const promises: Array<
		Promise<{ result: IteratorResult<T>; handler: IterableHandler<T> }>
	> = [];

	while (handlers.size) {
		promises.length = 0;
		for (const handler of handlers) promises.push(handler.promise);

		const { result, handler } = await Promise.race(promises);

		if (result.done) {
			handlers.delete(handler);
			yield { index: handler.index, done: true as const };
		} else {
			yield { index: handler.index, value: result.value, done: false as const };
			handler.advance();
		}
	}
}
