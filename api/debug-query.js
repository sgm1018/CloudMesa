// Script para probar diferentes casos de parentId
const userId = "68ae104d40becc8a01683bf0";

// Casos de prueba
const testCases = [
  {
    name: "parentId válido",
    parentId: "68b73d2335b4bce80779b608"
  },
  {
    name: "parentId cadena vacía",
    parentId: ""
  },
  {
    name: "parentId undefined",
    parentId: undefined
  },
  {
    name: "parentId null",
    parentId: null
  }
];

testCases.forEach(testCase => {
  console.log(`\n=== ${testCase.name} ===`);
  
  const filter = { 
    userId: userId, 
    parentId: testCase.parentId, 
    type: { $in: ["file", "folder"] } 
  };
  
  console.log("Filter:", JSON.stringify(filter, null, 2));
  
  // Verificar si el filtro coincidiría con nuestros items
  const item1ParentId = ""; // Item 1
  const item2ParentId = "68b73d2335b4bce80779b608"; // Item 2
  
  console.log("Matches item 1 (parentId=''):", item1ParentId === testCase.parentId);
  console.log("Matches item 2 (parentId='68b73d2335b4bce80779b608'):", item2ParentId === testCase.parentId);
});
