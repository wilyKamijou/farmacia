import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import ModalCliente from './ModalCliente';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente | null) => void;
  onClienteCreado: () => void;
}

const ClienteSelector = ({ clientes, selectedCliente, onSelectCliente, onClienteCreado }: ClienteSelectorProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="cliente-selector">
      <h2 className="cliente-selector-title">Cliente</h2>
      
      {selectedCliente ? (
        <div className="cliente-seleccionado">
          <div>
            <p className="cliente-nombre">{selectedCliente.nombre} {selectedCliente.apellido}</p>
            <p className="cliente-telefono">{selectedCliente.telefono || 'Sin teléfono'}</p>
          </div>
          <button
            onClick={() => onSelectCliente(null)}
            className="cliente-remover"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div className="cliente-form">
          <select
            className="cliente-select"
            value=""
            onChange={(e) => {
              const cliente = clientes.find(c => c.id === e.target.value);
              if (cliente) onSelectCliente(cliente);
            }}
          >
            <option value="">Seleccionar cliente existente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellido} - {cliente.telefono || 'Sin teléfono'}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowModal(true)}
            className="cliente-nuevo-btn"
          >
            <UserPlus size={20} />
            Nuevo Cliente
          </button>
        </div>
      )}

      <ModalCliente
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onClienteCreado={onClienteCreado}
      />
    </div>
  );
};

export default ClienteSelector;