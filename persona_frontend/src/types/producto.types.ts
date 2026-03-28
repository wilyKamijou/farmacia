
export interface Categoria {
  id: string;
  nombreCt: string;
}

export interface Producto {
  id: string;
  nombrePr: string;
  nombreTc: string;
  fechaFab: string;
  fechaVenc: string;
  descripcionPr?: string;
  concentracionQm?: string;
  composicionQm?: string;
  precio?: number;  // 👈 AGREGAR precio al tipo Producto
  categoria: Categoria;
}

export interface GetAllProductosResponse {
  allProductos: Producto[];
}

export interface GetAllCategoriasResponse {
  allCategorias: Categoria[];
}

export interface CreateProductoResponse {
  crearProducto: {
    producto: Producto;
    ok: boolean;
    mensaje: string;
  };
}

export interface CreateProductoVariables {
  nombrePr: string;
  nombreTc: string;
  fechaFab: string;
  fechaVenc: string;
  categoriaId: string;
  descripcionPr?: string;
  concentracionQm?: string;
  composicionQm?: string;
  precio?: number;  // 👈 AGREGAR precio al tipo de variables (puede ser string para enviar al backend)
}

export interface UpdateProductoResponse {
  actualizarProducto: {
    producto: Producto;
    ok: boolean;
    mensaje: string;
  };
}

export interface UpdateProductoVariables {
  id: string;
  nombrePr?: string;
  nombreTc?: string;
  fechaFab?: string;
  fechaVenc?: string;
  categoriaId?: string;
  descripcionPr?: string;
  concentracionQm?: string;
  composicionQm?: string;
  precio?: number;
}

export interface DeleteProductoResponse {
  eliminarProducto: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteProductoVariables {
  id: string;
}