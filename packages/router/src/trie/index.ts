class Segments {
	pattern: string;
	/** pattern segments */
	segments: string[];
	index = 0;

	constructor(pattern: string, param = false) {
		this.pattern = pattern;

		if (param) {
			this.segments = pattern.match(/:.+?(?=\/|$)/g) ?? []; // match the params
		} else {
			// static
			this.segments = pattern.split(/:.+?(?=\/|$)/); // split on the params

			// if the last segment is a param without a trailing slash
			// then there will be an empty string, remove
			if (this.segments.at(-1) === "") this.segments.pop();
		}
	}
}

export class Route<T> {
	/** value store returned when route is found */
	store: T;
	/** pattern ends with a wildcard */
	wildcard: boolean;
	static: Segments;
	param: Segments;

	constructor(pattern: string, store: T) {
		this.store = store;

		this.wildcard = pattern.endsWith("*");
		if (this.wildcard) pattern = pattern.slice(0, -1);

		this.static = new Segments(pattern);
		this.param = new Segments(pattern, true);
	}
}

class ParamNode<T> {
	/** name of the parameter (without the colon ":") */
	name: string;
	/** matched route */
	route: Route<T> | null = null;
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
	/** matched route */
	route: Route<T> | null = null;
	/** matched wildcard route */
	wildcardRoute: Route<T> | null = null;

	/**
	 * @param segment pattern segment
	 * @param staticChildren static children nodes to add to staticMap
	 * @param clone node to clone during construction
	 */
	constructor(segment = "/", staticChildren?: Node<T>[], clone?: Node<T>) {
		this.segment = segment;

		if (clone) {
			this.staticMap = clone.staticMap;
			this.paramChild = clone.paramChild;
			this.route = clone.route;
			this.wildcardRoute = clone.wildcardRoute;
		}

		if (staticChildren?.length) {
			this.staticMap ??= new Map();

			for (const child of staticChildren) {
				this.staticMap.set(child.segment.charCodeAt(0), child);
			}
		}
	}

	/**
	 * @param segment new segment
	 * @returns a clone of the Node with a new segment
	 */
	clone(segment: string) {
		return new Node(segment, [], this);
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
	fork(charIndex: number, segment: string) {
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
	split(segment: string) {
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
	 * @param route route return when pattern is matched
	 * @returns this - the Node
	 */
	add(route: Route<T>) {
		let current: Node<T> = this;

		// for each static segment, if there are no static segments, this is skipped
		for (
			;
			route.static.index < route.static.segments.length;
			route.static.index++
		) {
			let staticSegment = route.static.segments[route.static.index]!;

			if (route.static.index > 0) {
				// there is only a second static segment (could just be "/")
				// if there is a param to split them, so there must be a param here

				const paramChild = current.setParamChild(
					// param without the ":" (only increment when this is reached)
					route.param.segments[route.param.index++]!.slice(1),
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
						current.split(staticSegment);
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
					current = current.fork(charIndex, staticSegment);

					break; // next segment
				}

				// character is the same - rerun to check next char
				charIndex++;
			}
		}

		if (route.param.index < route.param.segments.length) {
			// final segment is a param
			current.setParamChild(
				route.param.segments[route.param.index]!.slice(1),
			).route ??= route;
		} else if (route.wildcard) {
			// final segment is a wildcard
			current.wildcardRoute ??= route;
		} else {
			// final segment is static
			current.route ??= route;
		}

		return this;
	}

	find(
		pathname: string,
		startIndex = 0,
	): {
		route: Route<T>;
		params: Record<string, string>;
	} | null {
		const endIndex = startIndex + this.segment.length;

		if (pathname.slice(startIndex, endIndex) !== this.segment) {
			// segment does not match current node segment
			return null;
		}

		// reached the end of the path
		if (endIndex === pathname.length) {
			if (this.route !== null) {
				// there is a store
				return {
					route: this.route,
					params: {},
				};
			}

			if (this.wildcardRoute !== null) {
				// there is a wildcard store
				return {
					route: this.wildcardRoute,
					params: { "*": "" },
				};
			}

			// no store
			return null;
		}

		// check for a static leaf that starts with the next character
		if (this.staticMap) {
			const staticChild = this.staticMap.get(pathname.charCodeAt(endIndex));

			if (staticChild) {
				const route = staticChild.find(pathname, endIndex);
				if (route) return route;
			}
		}

		// check for param leaf
		if (this.paramChild) {
			const slashIndex = pathname.indexOf("/", endIndex);

			if (slashIndex !== endIndex) {
				// params cannot be empty
				if (slashIndex === -1 || slashIndex >= pathname.length) {
					if (this.paramChild.route !== null) {
						return {
							route: this.paramChild.route,
							params: {
								[this.paramChild.name]: pathname.slice(
									endIndex,
									pathname.length,
								),
							},
						};
					}
				} else if (this.paramChild.staticChild) {
					console.log(this.paramChild.staticChild);
					// there's a static node after the param
					const route = this.paramChild.staticChild.find(pathname, slashIndex);

					if (route) {
						route.params[this.paramChild.name] = pathname.slice(
							endIndex,
							slashIndex,
						);
						return route;
					}
				}
			}
		}

		// check for wildcard leaf
		if (this.wildcardRoute !== null) {
			return {
				route: this.wildcardRoute,
				params: { "*": pathname.slice(endIndex, pathname.length) },
			};
		}

		return null;
	}
}
