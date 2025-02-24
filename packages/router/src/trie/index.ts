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

class Pattern {
	segments: { static: string[]; param: string[] };

	wildcard: boolean;

	constructor(pattern: string) {
		this.wildcard = pattern.endsWith("*");
		if (this.wildcard) pattern = pattern.slice(0, -1);

		const staticSegments = pattern.split(/:.+?(?=\/|$)/); // split on the params
		// if the last segment is a param without a trailing slash
		// then there will be an empty string, remove
		if (staticSegments.at(-1) === "") staticSegments.pop();

		this.segments = {
			static: staticSegments,
			param: pattern.match(/:.+?(?=\/|$)/g) ?? [], // match the params
		};
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

	/**
	 * @param segment new segment
	 * @returns a clone of the Node with a new segment
	 */
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
	 * @param charIndex	where to split the node
	 * @param segment new segment to use
	 * @returns the new child produced from the new segment
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

	/**
	 * @param pattern pattern to match
	 * @param store value to return when pattern is matched
	 * @returns this - the Node
	 */
	add(pattern: string, store: T) {
		const p = new Pattern(pattern);

		let current: Node<T> = this;
		let paramIndex = 0;

		// for each static segment, if there are no static segments, this is skipped
		for (
			let staticIndex = 0;
			staticIndex < p.segments.static.length;
			staticIndex++
		) {
			let staticSegment = p.segments.static[staticIndex]!;

			if (staticIndex > 0) {
				// there is only a second static segment (could just be "/")
				// if there is a param to split them, so there must be a param here

				const paramChild = current.setParamChild(
					// param without the ":" (only increment when this is reached)
					p.segments.param[paramIndex++]!.slice(1),
				);

				if (paramChild.staticChild) {
					// there's already a static child - need to check if it's a match
					current = paramChild.staticChild;
				} else {
					// new - create node with the next static segment
					current = paramChild.staticChild = new Node<T>(staticSegment);
					continue; // skip the rest since it's new
				}
			}

			for (let charIndex = 0; ; ) {
				if (charIndex === staticSegment.length) {
					// finished iterating through the staticSegment
					if (charIndex < current.segment.length) {
						current.splitStatic(staticSegment);
					}

					break; // next segment
				}

				if (charIndex === current.segment.length) {
					// passed the end of the current node
					if (!current.staticMap) {
						// new pattern, create new leaf
						current.staticMap = new Map();
					} else {
						// there's already static children,
						// check to see if there's a leaf that starts with the char
						const staticChild = current.staticMap.get(
							staticSegment.charCodeAt(charIndex),
						);

						if (staticChild) {
							// re-run loop with existing staticChild
							current = staticChild;
							staticSegment = staticSegment.slice(charIndex);
							charIndex = 0;
							continue;
						}
					}

					// otherwise, add new static child
					const staticChild = new Node<T>(staticSegment.slice(charIndex));
					current.staticMap.set(
						staticSegment.charCodeAt(charIndex),
						staticChild,
					);
					current = staticChild;

					break; // next segment
				}

				if (staticSegment[charIndex] !== current.segment[charIndex]) {
					// split
					current = current.forkStatic(charIndex, staticSegment);

					break; // next segment
				}

				// character is the same - rerun to check next char
				charIndex++;
			}
		}

		if (paramIndex < p.segments.param.length) {
			// final segment is a param
			current.setParamChild(p.segments.param[paramIndex]!.slice(1)).store ??=
				store;
		} else if (p.wildcard) {
			// final segment is a wildcard
			current.wildcardStore ??= store;
		} else {
			// final segment is static
			current.store ??= store;
		}

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
