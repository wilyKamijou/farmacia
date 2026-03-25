// src/pages/DashboardPage.tsx
import { Users, UserCheck, UserCog, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const cards = [
    {
      title: 'Personas',
      description: 'Usuarios que pueden iniciar sesión',
      icon: Users,
      link: '/dashboard/personas',
      color: 'from-blue-500 to-blue-600',
      accent: 'blue'
    },
    {
      title: 'Clientes',
      description: 'Clientes sin acceso de login',
      icon: UserCheck,
      link: '/dashboard/clientes',
      color: 'from-green-500 to-green-600',
      accent: 'green'
    },
    {
      title: 'Empleados',
      description: 'Personal con acceso al sistema',
      icon: UserCog,
      link: '/dashboard/empleados',
      color: 'from-purple-500 to-purple-600',
      accent: 'purple'
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Control</h1>
        <p className="text-gray-600 text-lg">Bienvenido a tu sistema de gestión de farmacia</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} to={card.link}>
              <div className="h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 overflow-hidden cursor-pointer">
                {/* Color Header */}
                <div className={`h-32 bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                  <Icon size={48} className="text-white" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className={`text-sm font-semibold text-${card.accent}-600`}>
                      Ir a {card.title} →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Section (Placeholder) */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-4 mb-6">
          <BarChart3 size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Resumen Rápido</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Personas</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Clientes</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Empleados</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
          </div>
        </div>
      </div>
    </div>
  );
}
