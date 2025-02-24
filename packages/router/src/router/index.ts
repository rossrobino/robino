class ParamNode<T> {
	/** name of the parameter (without the colon ":") */
	name: string;

	/** value store when path matches the node */
	store: T | null = null;

	/** static child node */
	inert: Node<T> | null = null;

	constructor(name: string) {
		this.name = name;
	}
}

class Node<T> {
	/** unique segment of the pattern trie */
	segment: string;

	/** static child node map */
	inert: Record<number, Node<T>> | null = null;

	/** parametric child node */
	params: ParamNode<T> | null = null;

	/** value store */
	store: T | null = null;
	wildcardStore: T | null = null;

	constructor(segment: string, inertChildren?: Node<T>[]) {
		this.segment = segment;

		if (inertChildren?.length) {
			this.inert = {};
			for (const child of inertChildren) {
				this.inert[child.segment.charCodeAt(0)] = child;
			}
		}
	}

	clone(segment: string): Node<T> {
		return {
			...this,
			segment,
		};
	}
}

export class Router<T> {
	#root = new Node<T>("/");

	add(pattern: string, store: T) {
		if (pattern[0] !== "/") {
			throw new Error(
				`Invalid route: ${pattern}\nRoute pattern must begin with "/"`,
			);
		}

		const endsWithWildcard = pattern.endsWith("*");
		if (endsWithWildcard) pattern = pattern.slice(0, -1);

		const inertSegments = pattern.split(/:.+?(?=\/|$)/);
		const paramSegments = pattern.match(/:.+?(?=\/|$)/g) ?? [];

		if (inertSegments.at(-1) === "") {
			// if the last segment was a param then there will
			// be an empty string - remove
			inertSegments.pop();
		}

		// set to root, create if not there
		let node = this.#root;
		let paramIndex = 0;

		for (let inertIndex = 0; inertIndex < inertSegments.length; inertIndex++) {
			let segment = inertSegments[inertIndex]!;

			if (inertIndex > 0) {
				// if we get to here, it means there is an param in between
				// two inert segments: ".../inert/:param/inert..."

				// param without the ":" (only increment after the first loop)
				const name = paramSegments[paramIndex++]!.slice(1);

				if (!node.params) {
					// there isn't another pattern with params already
					node.params = new ParamNode<T>(name);
				} else if (node.params.name !== name) {
					throw new Error(
						`Cannot create route "${pattern}" with parameter "${name}" - route exists with a different parameter ("${node.params.name}") in the same location.`,
					);
				}

				if (!node.params.inert) {
					// create node with the next inert segment
					node = node.params.inert = new Node<T>(segment);
					continue;
				}

				node = node.params.inert;
			}

			for (let charIndex = 0; ; ) {
				if (charIndex === segment.length) {
					// passed the end of the segment
					if (charIndex < node.segment.length) {
						// move current node down
						Object.assign(
							node,
							new Node(segment, [node.clone(node.segment.slice(charIndex))]),
						);
					}
					break;
				}

				if (charIndex === node.segment.length) {
					// at the end of the segment
					if (!node.inert) {
						node.inert = {};
					} else {
						const inert = node.inert[segment.charCodeAt(charIndex)];

						if (inert) {
							// re-run loop with existing inert node
							node = inert;
							segment = segment.slice(charIndex);
							charIndex = 0;
							continue;
						}
					}

					// add new inert child
					node = node.inert[segment.charCodeAt(charIndex)] = new Node<T>(
						segment.slice(charIndex),
					);

					break;
				}

				if (segment[charIndex] !== node.segment[charIndex]) {
					// in this case if you had two patterns
					// "api/posts" and "api/movies"
					// segment[charIndex] "m", while node.segment[charIndex] "p"

					// split the node
					const existingChild = node.clone(node.segment.slice(charIndex)); // "posts/"
					const newChild = new Node<T>(segment.slice(charIndex)); // "movies/"

					Object.assign(
						node,
						// "api/" with the above as children
						new Node(node.segment.slice(0, charIndex), [
							existingChild,
							newChild,
						]),
					);

					node = newChild;

					break;
				}

				// character is the same - rerun to check next char
				charIndex++;
			}
		}

		if (paramIndex < paramSegments.length) {
			// final segment is a param
			const name = paramSegments[paramIndex++]!.slice(1);

			if (!node.params) {
				// nothing, assign child
				node.params = new ParamNode<T>(name);
			} else if (node.params.name !== name) {
				// param with a different name
				throw new Error(
					`Cannot create route "${pattern}" with parameter "${name}" - route exists with a different parameter ("${node.params.name}") in the same location.`,
				);
			}

			node.params.store ??= store;

			return this;
		}

		if (endsWithWildcard) {
			// final segment is a wildcard
			node.wildcardStore ??= store;

			return this;
		}

		// final segment is inert
		node.store ??= store;

		return this;
	}

	find(
		path: string,
		node = this.#root,
		startIndex = 0,
	): {
		store: T;
		params: Record<string, string>;
	} | null {
		const endIndex = startIndex + node.segment.length;

		if (path.slice(startIndex, endIndex) !== node.segment) {
			// segment does not match current node segment
			return null;
		}

		// reached the end of the path
		if (endIndex === path.length) {
			if (node.store !== null) {
				// there is a store
				return {
					store: node.store,
					params: {},
				};
			}

			if (node.wildcardStore !== null) {
				// there is a wildcard store
				return {
					store: node.wildcardStore,
					params: { "*": "" },
				};
			}

			// no store
			return null;
		}

		// check for a static leaf that starts with the next character
		if (node.inert) {
			const inert = node.inert[path.charCodeAt(endIndex)];

			if (inert) {
				const route = this.find(path, inert, endIndex);
				if (route) return route;
			}
		}

		// check for param leaf
		if (node.params) {
			const slashIndex = path.indexOf("/", endIndex);

			if (slashIndex !== endIndex) {
				// params cannot be empty
				if (slashIndex === -1 || slashIndex >= path.length) {
					if (node.params.store !== null) {
						return {
							store: node.params.store,
							params: { [node.params.name]: path.slice(endIndex, path.length) },
						};
					}
				} else if (node.params.inert) {
					// there's a inert node after the param
					const route = this.find(path, node.params.inert, slashIndex);

					if (route) {
						route.params[node.params.name] = path.slice(endIndex, slashIndex);
						return route;
					}
				}
			}
		}

		// check for wildcard leaf
		if (node.wildcardStore !== null) {
			return {
				store: node.wildcardStore,
				params: { "*": path.slice(endIndex, path.length) },
			};
		}

		return null;
	}
}
