(function(root) {
    var Status = {
			Raw: {},
			Started:{},
			Initializing: {}
		},
		modules = {/*
			moduleName: {
				module: "module value",
				factory: "factory function",
				definition: "module definition Object"
			}
		*/},
		defaultDefnition = {
			dependencies: []
		},
		status = Status.Raw;

	var originalMingler = root.Mingler;
	var mingler = root.Mingler = function() {};

	/*************
	 * pulic API *
	 *************/
	mingler.noConflict = function() {
		root.Mingler = originalMingler;
		return mingler;
	};

	mingler.definition = function(name) {
		if (!_.isString(name)) {
			throw new TypeError("module name must be a String");
		}
		return modules[name] && modules[name].definition;
	};

	mingler.module = function(name, definitionOrFactory) {
		if (!_.isString(name)) {
			throw new TypeError("module name must be a String");
		}
		// retrieve module
		if (_.isUndefined(definitionOrFactory)) {
			return modules[name].module;
		}
		// define module with default definitions
		if (_.isFunction(definitionOrFactory)) {
			return defineModule(name, { factory: definitionOrFactory });
		}
		// define module with specified definition
		return defineModule(name, definitionOrFactory);
	};

	mingler.mingle = mingler.start = function() {
		if (status === Status.Raw) {
			startContainer();
			status = Status.Started;
		}
	};

	/***************************
	 * internal implementation *
	 ***************************/

	function defineModule(name, definition) {
		if (!_.isObject(definition)) {
			throw new TypeError("module definition must be an Object");
		}
		if (!_.isFunction(definition.factory)) {
			throw new TypeError("module factory must be a function");
		}
		modules[name] = {
			module: Status.Raw,
			definition: _.defaults(definition, defaultDefnition)
		};
		if (status === Status.Started) {
			initializeModule.call([], modules[name], name);
		}
	}

	function startContainer() {
		_.each(modules, initializeModule, []);
	}

	function initializeModule(moduleHolder, moduleName) {
		this.push(moduleName);
		if (moduleHolder.module === Status.Initializing) {
			throw new Error("Circular dependencies detected - [" + this.join(" -> ") + "].");
		} else if (moduleHolder.module === Status.Raw) {
			moduleHolder.module = Status.Initializing;
			moduleHolder.module = createModule.call(this, moduleHolder);
		}
		this.pop();
		return moduleHolder.module;
	}

	function createModule(moduleHolder) {
		var definition = moduleHolder.definition;
		var dependencies = initDependencies.call(this, definition.dependencies);
		return definition.factory.apply(definition, dependencies);
	}

	function initDependencies(dependencies) {
		var asArray = _.isArray(dependencies);
		var deps = _.reduce(dependencies, initDependency, asArray ? [] : {}, this);
		return asArray ? deps : [deps];
	}

	function initDependency(result, name, key) {
		if (_(modules).has(name)) {
			result[key] = initializeModule.call(this, modules[name], name)
			return result;
		}
		throw new Error("Unknown dependency[" + name + "] of module[" + this.pop() + "]");
	}
})(this);
