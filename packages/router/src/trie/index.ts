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

export class Node<T> {
	/** unique segment of the pattern trie */
	segment: string;

	/** static child node map, key is the first character in the segment */
	staticMap: Map<number, Node<T>> | null = null;

	/** parametric child node */
	paramChild: ParamNode<T> | null = null;

	/** value store */
	store: T | null = null;

	/** wildcard value store */
	wildcardStore: T | null = null;

	/**
	 * @param segment pattern segment
	 * @param staticChildren static children nodes to add to staticMap
	 */
	constructor(segment = "/", staticChildren?: Node<T>[]) {
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

	/**
	 * if the current segment is "api/posts"
	 * and "api/movies" is added,
	 * the node will need to be reassigned to "api/" and create two static children
	 *
	 * @param charIndex
	 * @param segment
	 * @returns the new child produced from the staticSegment
	 */
	forkStatic(charIndex: number, segment: string) {
		const existingChild = this.clone(this.segment.slice(charIndex)); // "posts/"
		const newChild = new Node<T>(segment.slice(charIndex)); // "movies/"

		Object.assign(
			this,
			// "api/" with the above as children
			new Node(this.segment.slice(0, charIndex), [existingChild, newChild]),
		);

		return newChild;
	}

	/**
	 * node.segment = "static/static",
	 * staticSegment = "static/",
	 * then the node needs to be split to accommodate the shorter segment
	 *
	 * @param segment
	 */
	splitStatic(segment: string) {
		const secondHalf = this.clone(this.segment.slice(segment.length));

		Object.assign(this, new Node(segment, [secondHalf]));
	}

	/**
	 * @param name name of the param
	 * @returns the existing child with the same name, or creates a new
	 */
	setParamChild(name: string) {
		if (this.paramChild && this.paramChild.name !== name) {
			throw new Error(
				`Cannot create parameter "${name}" because a different parameter ("${this.paramChild.name}") already exists in this location.\n\n${this}`,
			);
		}

		return (this.paramChild ??= new ParamNode<T>(name));
	}

	add(pattern: string, store: T) {
		const endsWithWildcard = pattern.endsWith("*");
		if (endsWithWildcard) pattern = pattern.slice(0, -1);

		const staticSegments = pattern.split(/:.+?(?=\/|$)/); // split on the params
		const paramSegments = pattern.match(/:.+?(?=\/|$)/g) ?? []; // match the params

		if (staticSegments.at(-1) === "") {
			// if the last segment is a param then there will
			// be an empty string, remove
			staticSegments.pop();
		}

		let node: Node<T> = this;
		let paramIndex = 0;

		// add static segments, if there are no static segments, this is skipped
		for (
			let staticIndex = 0;
			staticIndex < staticSegments.length;
			staticIndex++
		) {
			let staticSegment = staticSegments[staticIndex]!;

			if (staticIndex > 0) {
				// there is only a second static segment (could just be "/")
				// if there is a param to split them, so there must be a param here

				// param without the ":" (only increment when this is reached)
				const name = paramSegments[paramIndex++]!.slice(1);

				const paramChild = node.setParamChild(name);

				if (!paramChild.staticChild) {
					// create node with the next static segment
					node = paramChild.staticChild = new Node<T>(staticSegment);
					continue;
				}

				node = paramChild.staticChild;
			}

			for (let charIndex = 0; ; ) {
				if (charIndex === staticSegment.length) {
					// finished iterating through the staticSegment
					if (charIndex < node.segment.length) {
						node.splitStatic(staticSegment);
					}

					break; // next segment
				}

				if (charIndex === node.segment.length) {
					// passed the end of the current node
					if (!node.staticMap) {
						// new pattern, create new leaf
						node.staticMap = new Map();
					} else {
						// there's already static children,
						// check to see if there's a leaf that starts with the char
						const staticChild = node.staticMap.get(
							staticSegment.charCodeAt(charIndex),
						);

						if (staticChild) {
							// re-run loop with existing staticChild
							node = staticChild;
							staticSegment = staticSegment.slice(charIndex);
							charIndex = 0;
							continue;
						}
					}

					// otherwise, add new static child
					const staticChild = new Node<T>(staticSegment.slice(charIndex));
					node.staticMap.set(staticSegment.charCodeAt(charIndex), staticChild);
					node = staticChild;

					break; // next segment
				}

				if (staticSegment[charIndex] !== node.segment[charIndex]) {
					// split
					node = node.forkStatic(charIndex, staticSegment);

					break; // next segment
				}

				// character is the same - rerun to check next char
				charIndex++;
			}
		}

		if (paramIndex < paramSegments.length) {
			// final segment is a param
			const name = paramSegments[paramIndex++]!.slice(1);
			const paramChild = node.setParamChild(name);

			paramChild.store ??= store;

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
		node: Node<T> = this,
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
