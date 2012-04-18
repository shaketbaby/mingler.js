(function(root) {
    var started = false,
		Status = {
			Raw: {},
			Initializing: {}
		},
		modules = {/*
			moduleName: {
				module: "module value object",
				definition: "module definition Object"
			}
		*/};

	var originalMingler = root.Mingler;
	var mingler = root.Mingler = function() {};

	/*************
	 * pulic API *
	 *************/ 
	mingler.noConflict = function() {
		root.Mingler = originalMingler;
		return mingler;
	};

	mingler.definition = function(name, definition) {
		return getModuleOrDefinitionOrDefineModule(name, definition, "definition");
	};
	
	mingler.module = function(name, definition) {
		return getModuleOrDefinitionOrDefineModule(name, definition, "module");
	};
	
	mingler.mingle = mingler.start = function() {
		_.each(modules, initializeModule, []);
	};

	/***************************
	 * internal implementation *
	 ***************************/
	function getModuleOrDefinitionOrDefineModule(name, definition, moduleOrDefinition) {
		if (!_.isString(name)) {
			throw new Error("module name must be a String");
		}
		if (_.isUndefined(definition)) {
			return modules[name][moduleOrDefinition];
		}
		if (!_.isObject(definition)) {
			throw new Error("module definition must be an Object");
		}
		return defineModule(name, definition);
	}
	
	function defineModule(name, definition) {
		if (!_.isFunction(definition.factory)) {
			throw new Error("module must have a 'factory' function!");
		}
		// should we clone definition here? shadow or deep?
		modules[name] = {
			module: Status.Raw,
			definition: definition
		};
	}
	
	function initializeModule(moduleHolder, moduleName) {
		this.push(moduleName);
		if (moduleHolder.module === Status.Initializing) {
			throw new Error("Circular dependencies detected - [" + this.join(" -> ") + "].");
		} else if (moduleHolder.module === Status.Raw) {
			moduleHolder.module = Status.Initializing;
			moduleHolder.module = createModule.call(this, moduleHolder.definition);
		}
		this.pop();
		return moduleHolder.module;
	}
	
	function createModule(definition) {
		var deps = definition.dependencies;
		if (_.isEmpty(deps)) {
			return definition.factory();
		}
		return definition.factory.apply(definition, initDependencies.call(this, deps));
	}
	
	function initDependencies(dependencies) {
		var asArray = _.isArray(dependencies);
		var deps = _.reduce(dependencies, initDependency, asArray ? [] : {}, this);
		return asArray ? deps : [deps];
	}

	function initDependency(result, name, key) {
		if (_(modules).has(name)) {
			return (result[key] = initializeModule.call(this, modules[name], name), result);
		}
		throw new Error("Unknown dependency[" + name + "] of module[" + this.pop() + "]");
	}
})(this);
