class ParamNode<T> {
	/** name of the parameter (without the colon ":") */
	name: string;

	/** value store when path matches the node */
	store: T | null = null;

	/** static child node */
	staticChild: Node<T> | null = null;

	constructor(name: string) {
		this.name = name;
	}
}

class Node<T> {
	/** unique segment of the pattern trie */
	segment: string;

	/** Static child node map, key is the first character in the segment */
	staticMap: Map<number, Node<T>> | null = null;

	/** parametric child node */
	paramChild: ParamNode<T> | null = null;

	/** value store */
	store: T | null = null;
	wildcardStore: T | null = null;

	constructor(segment: string, staticChildren?: Node<T>[]) {
		this.segment = segment;

		if (staticChildren?.length) {
			this.staticMap = new Map();
			for (const child of staticChildren) {
				this.staticMap.set(child.segment.charCodeAt(0), child);
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

		const staticSegments = pattern.split(/:.+?(?=\/|$)/);
		const paramSegments = pattern.match(/:.+?(?=\/|$)/g) ?? [];

		if (staticSegments.at(-1) === "") {
			// if the last segment was a param then there will
			// be an empty string - remove
			staticSegments.pop();
		}

		// set to root, create if not there
		let node = this.#root;
		let paramIndex = 0;

		for (
			let staticIndex = 0;
			staticIndex < staticSegments.length;
			staticIndex++
		) {
			let segment = staticSegments[staticIndex]!;

			if (staticIndex > 0) {
				// if we get to here, it means there is an param in between
				// two static segments: ".../static/:param/static..."

				// param without the ":" (only increment after the first loop)
				const name = paramSegments[paramIndex++]!.slice(1);

				if (!node.paramChild) {
					// there isn't another pattern with params already
					node.paramChild = new ParamNode<T>(name);
				} else if (node.paramChild.name !== name) {
					throw new Error(
						`Cannot create route "${pattern}" with parameter "${name}" - route exists with a different parameter ("${node.paramChild.name}") in the same location.`,
					);
				}

				if (!node.paramChild.staticChild) {
					// create node with the next static segment
					node = node.paramChild.staticChild = new Node<T>(segment);
					continue;
				}

				node = node.paramChild.staticChild;
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
					if (!node.staticMap) {
						node.staticMap = new Map();
					} else {
						const staticChild = node.staticMap.get(
							segment.charCodeAt(charIndex),
						);

						if (staticChild) {
							// re-run loop with existing static child
							node = staticChild;
							segment = segment.slice(charIndex);
							charIndex = 0;
							continue;
						}
					}

					// add new static child
					node.staticMap.set(
						segment.charCodeAt(charIndex),
						new Node<T>(segment.slice(charIndex)),
					);

					node = node.staticMap.get(segment.charCodeAt(charIndex))!;

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

			if (!node.paramChild) {
				// nothing, assign child
				node.paramChild = new ParamNode<T>(name);
			} else if (node.paramChild.name !== name) {
				// param with a different name
				throw new Error(
					`Cannot create route "${pattern}" with parameter "${name}" - route exists with a different parameter ("${node.paramChild.name}") in the same location.`,
				);
			}

			node.paramChild.store ??= store;

			return this;
		}

		if (endsWithWildcard) {
			// final segment is a wildcard
			node.wildcardStore ??= store;

			return this;
		}

		// final segment is static
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
		if (node.staticMap) {
			const staticChild = node.staticMap.get(path.charCodeAt(endIndex));

			if (staticChild) {
				const route = this.find(path, staticChild, endIndex);
				if (route) return route;
			}
		}

		// check for param leaf
		if (node.paramChild) {
			const slashIndex = path.indexOf("/", endIndex);

			if (slashIndex !== endIndex) {
				// params cannot be empty
				if (slashIndex === -1 || slashIndex >= path.length) {
					if (node.paramChild.store !== null) {
						return {
							store: node.paramChild.store,
							params: {
								[node.paramChild.name]: path.slice(endIndex, path.length),
							},
						};
					}
				} else if (node.paramChild.staticChild) {
					// there's a static node after the param
					const route = this.find(
						path,
						node.paramChild.staticChild,
						slashIndex,
					);

					if (route) {
						route.params[node.paramChild.name] = path.slice(
							endIndex,
							slashIndex,
						);
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
