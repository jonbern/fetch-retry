"use strict";

module.exports = function (fetch, defaults) {
	defaults = defaults || {};
	if (typeof fetch !== "function") {
		throw new ArgumentError("fetch must be a function");
	}

	if (typeof defaults !== "object") {
		throw new ArgumentError("defaults must be an object");
	}
  
	if (
		defaults.retries !== undefined &&
		!isPositiveInteger(defaults.retries)
	) {
		throw new ArgumentError("retries must be a positive integer");
	}

	if (
		defaults.retryDelay !== undefined &&
		!isPositiveInteger(defaults.retryDelay) &&
		typeof defaults.retryDelay !== "function"
	) {
		throw new ArgumentError(
			"retryDelay must be a positive integer or a function returning a positive integer"
		);
	}

	if (
		defaults.retryOn !== undefined &&
		!Array.isArray(defaults.retryOn) &&
		typeof defaults.retryOn !== "function"
	) {
		throw new ArgumentError(
			"retryOn property expects an array or function"
		);
	}

	var baseDefaults = {
		retries: 3,
		retryDelay: 1000,
		retryOn: [],
	};

	defaults = Object.assign(baseDefaults, defaults);

	return function fetchRetry(input, init) {
		var retries = defaults.retries;
		var retryDelay = defaults.retryDelay;
		var retryOn = defaults.retryOn;

		if (init && init.retries !== undefined) {
			if (isPositiveInteger(init.retries)) {
				retries = init.retries;
			} else {
				throw new ArgumentError("retries must be a positive integer");
			}
		}

		if (init && init.retryDelay !== undefined) {
			if (
				isPositiveInteger(init.retryDelay) ||
				typeof init.retryDelay === "function"
			) {
				retryDelay = init.retryDelay;
			} else {
				throw new ArgumentError(
					"retryDelay must be a positive integer or a function returning a positive integer"
				);
			}
		}

		if (init && init.retryOn) {
			if (
				Array.isArray(init.retryOn) ||
				typeof init.retryOn === "function"
			) {
				retryOn = init.retryOn;
			} else {
				throw new ArgumentError(
					"retryOn property expects an array or function"
				);
			}
		}

		// eslint-disable-next-line no-undef
		return new Promise(function (resolve, reject) {
			var wrappedFetch = async function (attempt) {
				var _input =
					typeof Request !== "undefined" && input instanceof Request
						? input.clone()
						: input;
				try {
					const response = await fetch(_input, init);
					if (
						Array.isArray(retryOn) &&
						retryOn.indexOf(response.status) === -1
					) {
						resolve(response);
					} else if (typeof retryOn === "function") {
						try {
							const retryOnResponse = await Promise.resolve(
								retryOn(attempt, null, response)
							);

							if (retryOnResponse) {
								retry(attempt, null, response);
							} else {
								resolve(response);
							}
						} catch (error) {
							reject(error);
						}
					} else {
						if (attempt < retries) {
							retry(attempt, null, response);
						} else {
							resolve(response);
						}
					}
				} catch (error) {
					if (typeof retryOn === "function") {
						try {
							const retryOnResponse = await Promise.resolve(
								retryOn(attempt, error, null)
							);

							if (retryOnResponse) {
								retry(attempt, error, null);
							} else {
								reject(error);
							}
						} catch (error) {
							reject(error);
						}
					} else if (attempt < retries) {
						retry(attempt, error, null);
					} else {
						reject(error);
					}
				}
			};

			function retry(attempt, error, response) {
				var delay =
					typeof retryDelay === "function"
						? retryDelay(attempt, error, response)
						: retryDelay;
				setTimeout(function () {
					wrappedFetch(++attempt);
				}, delay);
			}

			wrappedFetch(0);
		});
	};
};

function isPositiveInteger(value) {
	return Number.isInteger(value) && value >= 0;
}

function ArgumentError(message) {
	this.name = "ArgumentError";
	this.message = message;
}
