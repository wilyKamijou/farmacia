# apps/personas/graphql/queries.py
import graphene
from .types import PersonaType, EmpleadoType, VentaType, CategoriaType, ProductoType, AlmacenType, ProductoAlmacenType, DetalleVentaType
from apps.personas.models import Persona, Empleado, Venta, Categoria, Producto, Almacen, ProductoAlmacen, DetalleVenta

class Query(graphene.ObjectType):
    # ==================== QUERIES PERSONA ====================
    all_personas = graphene.List(PersonaType)
    persona = graphene.Field(PersonaType, id=graphene.ID(required=True))
    personas_activas = graphene.List(PersonaType)
    me = graphene.Field(PersonaType)
    
    # ==================== QUERIES EMPLEADO ====================
    all_empleados = graphene.List(EmpleadoType)
    empleado = graphene.Field(EmpleadoType, id=graphene.ID(required=True))
    empleados_activos = graphene.List(EmpleadoType)
    
    # ==================== QUERIES VENTA ====================
    all_ventas = graphene.List(VentaType)
    venta = graphene.Field(VentaType, id=graphene.ID(required=True))
    ventas_por_persona = graphene.List(VentaType, persona_id=graphene.ID(required=True))
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
    
    # ==================== RESOLVERS PERSONA ====================
    def resolve_all_personas(self, info, **kwargs):
        return Persona.objects.all()
    
    def resolve_persona(self, info, id):
        try:
            return Persona.objects.get(pk=id)
        except Persona.DoesNotExist:
            return None
    
    def resolve_personas_activas(self, info, **kwargs):
        return Persona.objects.filter(activo=True)
    
    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated:
            return user
        return None
    
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
    
    # ==================== RESOLVERS VENTA ====================
    def resolve_all_ventas(self, info, **kwargs):
        return Venta.objects.all()
    
    def resolve_venta(self, info, id):
        try:
            return Venta.objects.get(pk=id)
        except Venta.DoesNotExist:
            return None
    
    def resolve_ventas_por_persona(self, info, persona_id):
        try:
            return Venta.objects.filter(persona_id=persona_id)
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