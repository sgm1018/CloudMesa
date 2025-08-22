import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-blue-600">¡Aplicación funcionando!</h1>
        <p className="mt-4 text-gray-600">Si ves esto, la aplicación está renderizando correctamente.</p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800">✅ React está funcionando</p>
          <p className="text-green-800">✅ Tailwind CSS está funcionando</p>
          <p className="text-green-800">✅ Los componentes se renderizan</p>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
