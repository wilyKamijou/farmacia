# apps/personas/graphql/queries.py
import graphene
from graphql import GraphQLError
from .types import ClienteType, EmpleadoType, VentaType, CategoriaType, ProductoType, AlmacenType, ProductoAlmacenType, DetalleVentaType
from apps.personas.models import Cliente, Empleado, Venta, Categoria, Producto, Almacen, ProductoAlmacen, DetalleVenta

class Query(graphene.ObjectType):
    # ==================== QUERIES CLIENTE ====================
    all_clientes = graphene.List(ClienteType)
    cliente = graphene.Field(ClienteType, id=graphene.ID(required=True))
    clientes_activos = graphene.List(ClienteType)
    
    # ==================== QUERIES EMPLEADO ====================
    all_empleados = graphene.List(EmpleadoType)
    empleado = graphene.Field(EmpleadoType, id=graphene.ID(required=True))
    empleados_activos = graphene.List(EmpleadoType)
    me = graphene.Field(EmpleadoType)  # ✅ Cambiado a EmpleadoType
    
    # ==================== QUERIES VENTA ====================
    all_ventas = graphene.List(VentaType)
    venta = graphene.Field(VentaType, id=graphene.ID(required=True))
    ventas_por_cliente = graphene.List(VentaType, cliente_id=graphene.ID(required=True))  # ✅ Cambiado de persona a cliente
    ventas_por_empleado = graphene.List(VentaType, empleado_id=graphene.ID(required=True))
    
    # ==================== QUERIES CATEGORIA ====================
    all_categorias = graphene.List(CategoriaType)
    categoria = graphene.Field(CategoriaType, id=graphene.ID(required=True))
    
    # ==================== QUERIES PRODUCTO ====================
    all_productos = graphene.List(ProductoType)
    producto = graphene.Field(ProductoType, id=graphene.ID(required=True))
    productos_por_categoria = graphene.List(ProductoType, categoria_id=graphene.ID(required=True))
    
    # ==================== QUERIES ALMACEN ====================
    all_almacenes = graphene.List(AlmacenType)
    almacen = graphene.Field(AlmacenType, id=graphene.ID(required=True))
    
    # ==================== QUERIES PRODUCTO ALMACEN ====================
    all_productos_almacen = graphene.List(ProductoAlmacenType)
    producto_almacen = graphene.Field(ProductoAlmacenType, id=graphene.ID(required=True))
    productos_almacen_por_producto = graphene.List(ProductoAlmacenType, producto_id=graphene.ID(required=True))
    productos_almacen_por_almacen = graphene.List(ProductoAlmacenType, almacen_id=graphene.ID(required=True))
    
    # ==================== QUERIES DETALLE VENTA ====================
    all_detalles_venta = graphene.List(DetalleVentaType)
    detalle_venta = graphene.Field(DetalleVentaType, id=graphene.ID(required=True))
    detalles_por_venta = graphene.List(DetalleVentaType, venta_id=graphene.ID(required=True))
    
    # ==================== RESOLVERS CLIENTE ====================
    def resolve_all_clientes(self, info, **kwargs):
        return Cliente.objects.all()
    
    def resolve_cliente(self, info, id):
        try:
            return Cliente.objects.get(pk=id)
        except Cliente.DoesNotExist:
            return None
    
    def resolve_clientes_activos(self, info, **kwargs):
        return Cliente.objects.filter(activo=True)
    
    # ==================== RESOLVERS EMPLEADO ====================
    def resolve_all_empleados(self, info, **kwargs):
        return Empleado.objects.all()
    
    def resolve_empleado(self, info, id):
        try:
            return Empleado.objects.get(pk=id)
        except Empleado.DoesNotExist:
            return None
    
    def resolve_empleados_activos(self, info, **kwargs):
        return Empleado.objects.filter(activo=True)
    
    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated and hasattr(user, 'is_2fa_enabled'):
            return user
        return None
    
    # ==================== RESOLVERS VENTA ====================
    def resolve_all_ventas(self, info, **kwargs):
        return Venta.objects.all()
    
    def resolve_venta(self, info, id):
        try:
            return Venta.objects.get(pk=id)
        except Venta.DoesNotExist:
            return None
    
    def resolve_ventas_por_cliente(self, info, cliente_id):
        try:
            return Venta.objects.filter(cliente_id=cliente_id)
        except Exception:
            return []
    
    def resolve_ventas_por_empleado(self, info, empleado_id):
        try:
            return Venta.objects.filter(empleado_id=empleado_id)
        except Exception:
            return []
    
    # ==================== RESOLVERS CATEGORIA ====================
    def resolve_all_categorias(self, info, **kwargs):
        return Categoria.objects.all()
    
    def resolve_categoria(self, info, id):
        try:
            return Categoria.objects.get(pk=id)
        except Categoria.DoesNotExist:
            return None
    
    # ==================== RESOLVERS PRODUCTO ====================
    def resolve_all_productos(self, info, **kwargs):
        return Producto.objects.all()
    
    def resolve_producto(self, info, id):
        try:
            return Producto.objects.get(pk=id)
        except Producto.DoesNotExist:
            return None
    
    def resolve_productos_por_categoria(self, info, categoria_id):
        try:
            return Producto.objects.filter(categoria_id=categoria_id)
        except Exception:
            return []
    
    # ==================== RESOLVERS ALMACEN ====================
    def resolve_all_almacenes(self, info, **kwargs):
        return Almacen.objects.all()
    
    def resolve_almacen(self, info, id):
        try:
            return Almacen.objects.get(pk=id)
        except Almacen.DoesNotExist:
            return None
    
    # ==================== RESOLVERS PRODUCTO ALMACEN ====================
    def resolve_all_productos_almacen(self, info, **kwargs):
        return ProductoAlmacen.objects.all()
    
    def resolve_producto_almacen(self, info, id):
        try:
            return ProductoAlmacen.objects.get(pk=id)
        except ProductoAlmacen.DoesNotExist:
            return None
    
    def resolve_productos_almacen_por_producto(self, info, producto_id):
        try:
            return ProductoAlmacen.objects.filter(producto_id=producto_id)
        except Exception:
            return []
    
    def resolve_productos_almacen_por_almacen(self, info, almacen_id):
        try:
            return ProductoAlmacen.objects.filter(almacen_id=almacen_id)
        except Exception:
            return []
    
    # ==================== RESOLVERS DETALLE VENTA ====================
    def resolve_all_detalles_venta(self, info, **kwargs):
        return DetalleVenta.objects.all()
    
    def resolve_detalle_venta(self, info, id):
        try:
            return DetalleVenta.objects.get(pk=id)
        except DetalleVenta.DoesNotExist:
            return None
    
    def resolve_detalles_por_venta(self, info, venta_id):
        try:
            return DetalleVenta.objects.filter(venta_id=venta_id)
        except Exception:
            return []