describe("Mingler", function()
{
	it("should add itself to the global scope", function()
	{
		expect(Mingler).toBeDefined();
	});

	describe(".defineModule()", function()
	{
		it("should throw error when it is called with no arguments", function()
		{
			expect(Mingler.defineModule).toThrow(new Error("module definition required!"));
		});

		it("should throw error when module name is not a string", function()
		{
			expect(function() {
				Mingler.defineModule({ name: 34 });
			}).toThrow(new Error("module 'name' must be a string!"));
		});
		
		it("should throw error when factory function is not specified", function()
		{
			expect(function() {
				Mingler.defineModule({ name: "moduleName" })
			}).toThrow(new Error("module must have a 'factory' function!"));
		});
	});
	
	describe(".getDefinition()", function() {
		var moduleDefinition = {
				name: "moduleName",
				factory: function() {}
			};

		beforeEach(function() {
			Mingler.defineModule(moduleDefinition);
		});

		it("should return module definition by module name", function() {
			expect(Mingler.getDefinition("moduleName")).toEqual(moduleDefinition);
		});

		it("should return undefined for non-existed name", function() {
			expect(Mingler.getDefinition("noneExistedModuleName")).toBeUndefined();
		});
	});
	
	describe(".getModule()", function() {
		var moduleDefinition = {
				name: "moduleName",
				factory: function() { return "moduleValue";}
			};

		beforeEach(function() {
			Mingler.defineModule(moduleDefinition);
		});

		it("should return undefined before Mingler starts", function() {
			expect(Mingler.getModule("moduleName")).toBeUndefined();
			expect(Mingler.getModule("noneExistedModuleName")).toBeUndefined();
		});

		it("should return undefined for non-existed name before or after Mingler starts", function() {
			expect(Mingler.getModule("noneExistedModuleName")).toBeUndefined();
			Mingler.start();
			expect(Mingler.getModule("noneExistedModuleName")).toBeUndefined();
		});

		it("should be able to get module by name after Mingler started", function() {
			Mingler.start();
			expect(Mingler.getModule("moduleName")).toBe("moduleValue");
		});
	});

	describe(".start()", function() {
		var module1 = {
				name: "module1",
				factory: function() {
					this.initialized = true;
					return this;
				}
			},
			module2 = {
				name: "module2",
				factory: function() {
					this.initialized = true;
					return this;
				},
				initialized: false
			},
			module3 = {
				name: "module3",
				dependencies: ["module1", "module2"],
				factory: function(dep1, dep2) {
					this.count += 1;
					return [dep1, dep2];
				},
				count: 0
			},
			module4 = {
				name: "module4",
				dependencies: {
					dep1: "module1",
					dep2: "module3"
				},
				factory: function(dependencies) {
					return dependencies;
				}
			}
		
		beforeEach(function() {
			Mingler.defineModule(module1);
			Mingler.defineModule(module2);
		});

		it("should initialize all defined modules by calling their factory functions", function() {
			Mingler.start();
			
			expect(module1.initialized).toBe(true);
			expect(module2.initialized).toEqual(true);
			expect(Mingler.getModule("module1")).toBe(module1);
			expect(Mingler.getModule("module2")).toBe(module2);
		});

		it("should initialize module with each dependency passed as an argument to its factory", function() {
			Mingler.defineModule(module3);
			Mingler.start();
			
			expect(Mingler.getModule("module3")).toEqual([module1, module2]);
		});

		it("should initialize module with all dependencies passed inside an argument object to its factory", function() {
			Mingler.defineModule(module4);
			Mingler.defineModule(module3);
			Mingler.start();
			
			expect(Mingler.getModule("module3")).toEqual([module1, module2]);
			expect(Mingler.getModule("module4")).toEqual({
				dep1: module1, 
				dep2: Mingler.getModule("module3")
			});
		});

		it("should initialize each module only once", function() {
			Mingler.defineModule({
				name: "aModule",
				dependencies: ["dependency"],
				factory: function() {
					this.count++;
					return this;
				},
				count: 0
			});
			Mingler.defineModule({
				name: "dependency",
				factory: function() {
					this.count++;
					return this;
				},
				count: 0
			});
			Mingler.start();
			
			expect(Mingler.getModule("aModule").count).toEqual(1);
			expect(Mingler.getModule("dependency").count).toEqual(1);
		});

	});
});