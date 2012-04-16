(function(root) {

    var started = false,
		modules = {};

	var mingler = root.Mingler = {
		defineModule:  function(moduleDefinition) {
			checkDefinition(moduleDefinition);
			modules[moduleDefinition.name] = {definition: moduleDefinition};
		},
		getDefinition: function(moduleName) {
			return get(moduleName, "definition");
		},
		getModule: function(moduleName) {
			return get(moduleName, "value");
		},
		start: function() {
			_.each(modules, initializeModule);
		}
	};

	function checkDefinition(moduleDefinition) {
		if (!moduleDefinition) {
			throw new Error("module definition required!");
		}
		if (!_.isString(moduleDefinition.name)) {
			throw new Error("module 'name' must be a string!");
		}
		if (!moduleDefinition.factory) {
			throw new Error("module must have a 'factory' function!");
		}
	}
	
	function get(moduleName, prop) {
		return _(modules).has(moduleName) ? modules[moduleName][prop] : undefined;
	}
	
	function initializeModule(moduleHolder) {
		if (_.isUndefined(moduleHolder.value)) {
			var mDef = moduleHolder.definition;
			var mDeps = moduleHolder.definition.dependencies;
			if (!_.isEmpty(mDeps)) {
				mDeps = _.reduce(mDeps, initializeDependency, _.isArray(mDeps) ? [] : {});
			}
			moduleHolder.value = mDef.factory.apply(mDef, [].concat(mDeps));
		}
		return moduleHolder.value;
	}

	function initializeDependency(result, name, key) {
		return (result[key] = initializeModule(modules[name]), result);
	}

})(this);
