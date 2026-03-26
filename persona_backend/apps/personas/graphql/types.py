# apps/personas/graphql/types.py
import graphene
from graphene_django import DjangoObjectType
from apps.personas.models import Cliente, Empleado, Venta, Categoria, Producto, Almacen, ProductoAlmacen, DetalleVenta

class ClienteType(DjangoObjectType):
    class Meta:
        model = Cliente
        fields = "__all__"


class EmpleadoType(DjangoObjectType):
    class Meta:
        model = Empleado
        fields = "__all__"


class VentaType(DjangoObjectType):
    class Meta:
        model = Venta
        fields = "__all__"


class CategoriaType(DjangoObjectType):
    class Meta:
        model = Categoria
        fields = "__all__"


class ProductoType(DjangoObjectType):
    class Meta:
        model = Producto
        fields = "__all__"


class AlmacenType(DjangoObjectType):
    class Meta:
        model = Almacen
        fields = "__all__"


class ProductoAlmacenType(DjangoObjectType):
    class Meta:
        model = ProductoAlmacen
        fields = "__all__"


class DetalleVentaType(DjangoObjectType):
    class Meta:
        model = DetalleVenta
        fields = "__all__"

# ==================== TIPOS PARA REPORTES ====================

class AlmacenStockType(graphene.ObjectType):
    """Información de stock de un producto en un almacén"""
    almacenNombre = graphene.String()
    stock = graphene.Int()


class ProductoProximoVencerType(graphene.ObjectType):
    """Información de productos próximos a vencer"""
    id = graphene.ID()
    nombreComercial = graphene.String()
    nombreTecnico = graphene.String()
    fechaFabricacion = graphene.String()
    fechaVencimiento = graphene.String()
    diasFaltantes = graphene.Int()
    categoria = graphene.String()
    stockTotal = graphene.Int()
    almacenes = graphene.List(AlmacenStockType)
    porcentajeUrgencia = graphene.Float()


class ResumenInventarioType(graphene.ObjectType):
    """Resumen general del inventario"""
    totalProductos = graphene.Int()
    totalCategorias = graphene.Int()
    totalAlmacenes = graphene.Int()
    stockTotal = graphene.Int()


class TotalesUsuariosType(graphene.ObjectType):
    """Totales de usuarios del sistema"""
    totalClientes = graphene.Int()
    totalEmpleados = graphene.Int()
    empleadosActivos = graphene.Int()


class ReporteCompletoType(graphene.ObjectType):
    """Reporte completo del sistema"""
    usuarios = graphene.Field(TotalesUsuariosType)
    inventario = graphene.Field(ResumenInventarioType)
    productosProximoVencer = graphene.List(ProductoProximoVencerType)


# ==================== TIPOS PARA REPORTE DE VENTAS ====================

class VentasMesType(graphene.ObjectType):
    """Información de ventas por mes"""
    mes = graphene.String()
    ano = graphene.Int()
    totalVentas = graphene.Int()
    cantidadVendida = graphene.Int()
    cantidadArticulos = graphene.Int()
    promedioVenta = graphene.Float()


class FechaMayorVentaType(graphene.ObjectType):
    """Información de la fecha con mayor venta"""
    fecha = graphene.String()
    totalVentas = graphene.Int()
    montoTotal = graphene.Float()
    mejorProducto = graphene.String()
    cantidadProducto = graphene.Int()


class ReporteVentasType(graphene.ObjectType):
    """Reporte completo de ventas"""
    ventasPorMes = graphene.List(VentasMesType)
    fechaMayorVenta = graphene.Field(FechaMayorVentaType)
    totalVentasGenerales = graphene.Float()
    cantidadVentasGenerales = graphene.Int()