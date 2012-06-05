describe("Mingler", function()
{
	it("should add itself to the global scope", function()
	{
		expect(Mingler).toBeDefined();
	});

	it("should return undefined definition before register", function()
	{
		expect(Mingler.definition("notExistedModule")).toBeUndefined();
	});

	it("should be able to define a module", function()
	{
		var definition = {
			factory: function() {}
		};
		Mingler.module("someModule", definition);
		expect(Mingler.definition("someModule")).toEqual(definition);
	});
});